import * as Location from 'expo-location';
import { marcajeApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Marcaje, Resultado } from './types';

type RespuestaMarcaje =
  | { success: true; data: Marcaje }
  | { success: false; message: string };

const obtenerUbicacion = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const { coords } = await Location.getCurrentPositionAsync({});
    return { latitude: coords.latitude, longitude: coords.longitude };
  } catch {
    return null;
  }
};

const timeRegistrationService = async (): Promise<Resultado<Marcaje>> => {
  const ubicacion = await obtenerUbicacion();
  if (!ubicacion) {
    return fallo('Location permission is required to register your time.');
  }
  try {
    const { data } = await marcajeApi.post<RespuestaMarcaje>('/marcaje', {
      latCoordinate: ubicacion.latitude.toString(),
      longCoordinate: ubicacion.longitude.toString(),
    });
    return data.success ? exito(data.data) : fallo(data.message);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not register your time.'));
  }
};

export default timeRegistrationService;
