import * as Location from 'expo-location';
import { randomUUID } from 'expo-crypto';
import { marcajeApi } from './http';
import { syncPending } from './sync.service';
import { mensajeDeError } from '../lib/errors';
import { estaConectado, esErrorReintentable } from '../lib/connectivity';
import { diaLocal, estadoLocal, siguienteTipo } from '../lib/estadoLocal';
import usePendingStore, { PendingRegistration } from '../stores/pendingStore';
import useUserStore from '../stores/useStore';
import { exito, fallo, Marcaje, Resultado } from './types';

type RespuestaMarcaje =
  | { success: true; data: Marcaje }
  | { success: false; message: string };

export type ResultadoDeRegistro =
  | { mode: 'online'; marca: Marcaje }
  | { mode: 'queued'; pendiente: PendingRegistration };

const obtenerUbicacion = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      return { latitude: coords.latitude, longitude: coords.longitude };
    } catch {
      const ultima = await Location.getLastKnownPositionAsync();
      return ultima
        ? { latitude: ultima.coords.latitude, longitude: ultima.coords.longitude }
        : null;
    }
  } catch {
    return null;
  }
};

const timeRegistrationService = async (): Promise<Resultado<ResultadoDeRegistro>> => {
  const userId = useUserStore.getState().id;
  const ubicacion = await obtenerUbicacion();
  if (!ubicacion) {
    return fallo('Location permission is required to register your time.');
  }
  const latCoordinate = ubicacion.latitude.toString();
  const longCoordinate = ubicacion.longitude.toString();
  const tienda = usePendingStore.getState();
  const hayPendientes = tienda.pending.some((item) => item.userId === userId);

  if (!hayPendientes && (await estaConectado())) {
    try {
      const { data } = await marcajeApi.post<RespuestaMarcaje>('/marcaje', {
        latCoordinate,
        longCoordinate,
      });
      if (!data.success) {
        return fallo(data.message);
      }
      tienda.setKnownState({
        userId,
        day: diaLocal(),
        state: data.data.type === 'entry' ? 1 : 2,
      });
      return exito({ mode: 'online', marca: data.data });
    } catch (error) {
      if (!esErrorReintentable(error)) {
        return fallo(mensajeDeError(error, 'Could not register your time.'));
      }
    }
  }

  const actual = usePendingStore.getState();
  const tipo = siguienteTipo(
    estadoLocal(userId, actual.knownState, actual.pending),
  );
  if (!tipo) {
    return fallo('Your day is already complete.');
  }
  const pendiente: PendingRegistration = {
    clientId: randomUUID(),
    userId,
    recordedAt: new Date().toISOString(),
    latCoordinate,
    longCoordinate,
    type: tipo,
  };
  actual.enqueue(pendiente);
  void syncPending();
  return exito({ mode: 'queued', pendiente });
};

export default timeRegistrationService;
