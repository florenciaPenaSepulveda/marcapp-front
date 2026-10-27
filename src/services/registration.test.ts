import MockAdapter from 'axios-mock-adapter';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { marcajeApi } from './http';
import timeRegistrationService from './timeRegistration.service';
import { syncPending } from './sync.service';
import usePendingStore, { PendingRegistration } from '../stores/pendingStore';
import useTokenStore from '../stores/tokenStore';
import useUserStore from '../stores/useStore';
import { diaLocal } from '../lib/estadoLocal';

jest.mock('../session', () => ({
  cerrarSesion: jest.fn(),
  haySesion: () => require('../stores/tokenStore').default.getState().token !== '',
}));

const marcajes = new MockAdapter(marcajeApi);
const conectividad = NetInfo.fetch as jest.Mock;
const permiso = Location.requestForegroundPermissionsAsync as jest.Mock;
const actual = Location.getCurrentPositionAsync as jest.Mock;
const ultima = Location.getLastKnownPositionAsync as jest.Mock;

const marca = (type: 'entry' | 'exit', date = '11-03-2024 09:00:00') => ({
  id: 1,
  id_user: 7,
  date,
  type,
  adminFlag: false,
  latCoordinate: '-33.44',
  longCoordinate: '-70.66',
});

const sinConexion = () => {
  conectividad.mockResolvedValue({ isConnected: false, isInternetReachable: false });
  marcajes.onPost('/marcaje').networkError();
};
const conConexion = () => conectividad.mockResolvedValue({ isConnected: true, isInternetReachable: true });
const pendiente = (extra: Partial<PendingRegistration> = {}): PendingRegistration => ({
  clientId: '11111111-1111-4111-8111-111111111111',
  userId: 7,
  recordedAt: new Date().toISOString(),
  latCoordinate: '-33.44',
  longCoordinate: '-70.66',
  type: 'entry',
  ...extra,
});
const cuerpos = () => marcajes.history.post.map((p) => JSON.parse(p.data));
const vaciarCola = () => new Promise((resolver) => setTimeout(resolver, 0));

beforeEach(() => {
  marcajes.reset();
  jest.clearAllMocks();
  usePendingStore.setState({ pending: [], rejected: [], knownState: null });
  useUserStore.getState().clearUser();
  useUserStore.getState().setId(7);
  useTokenStore.setState({ token: 'sesion' });
  conConexion();
  permiso.mockResolvedValue({ status: 'granted' });
  actual.mockResolvedValue({ coords: { latitude: -33.44, longitude: -70.66 } });
  ultima.mockResolvedValue(null);
});

describe('registro en línea', () => {
  it('envía el marcaje con la ubicación, sin hora del dispositivo, y recuerda el estado', async () => {
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    const res = await timeRegistrationService();
    expect(res).toEqual({ success: true, data: { mode: 'online', marca: marca('entry') } });
    expect(cuerpos()[0]).toEqual({ latCoordinate: '-33.44', longCoordinate: '-70.66' });
    expect(usePendingStore.getState().knownState).toEqual({ userId: 7, day: diaLocal(), state: 1 });
    expect(usePendingStore.getState().pending).toHaveLength(0);
  });

  it('una salida en línea deja el día completo', async () => {
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('exit') });
    await timeRegistrationService();
    expect(usePendingStore.getState().knownState?.state).toBe(2);
  });

  it('muestra el rechazo del servidor sin guardar nada en el teléfono', async () => {
    marcajes.onPost('/marcaje').reply(201, { success: false, message: 'Please wait a few seconds before registering again' });
    expect(await timeRegistrationService()).toEqual({
      success: false,
      message: 'Please wait a few seconds before registering again',
    });
    expect(usePendingStore.getState().pending).toHaveLength(0);
  });

  it('no encola los errores que no son de conexión', async () => {
    marcajes.onPost('/marcaje').reply(400, { message: ['latCoordinate must be a latitude'] });
    const res = await timeRegistrationService();
    expect(res).toEqual({ success: false, message: 'latCoordinate must be a latitude' });
    expect(usePendingStore.getState().pending).toHaveLength(0);
  });
});

describe('registro sin conexión', () => {
  it('guarda la entrada en el teléfono con la hora del dispositivo cuando NetInfo informa que no hay red', async () => {
    sinConexion();
    const res = await timeRegistrationService();
    expect(res.success && res.data.mode).toBe('queued');
    expect(marcajes.history.post).toHaveLength(0);
    const [guardado] = usePendingStore.getState().pending;
    expect(guardado).toMatchObject({
      userId: 7,
      type: 'entry',
      latCoordinate: '-33.44',
      longCoordinate: '-70.66',
    });
    expect(guardado.clientId).toMatch(/^[0-9a-f-]{36}$/);
    expect(Math.abs(new Date(guardado.recordedAt).getTime() - Date.now())).toBeLessThan(5000);
  });

  it('guarda el registro cuando la solicitud falla por falta de señal aunque NetInfo diga que hay red', async () => {
    marcajes.onPost('/marcaje').networkError();
    const res = await timeRegistrationService();
    expect(res.success && res.data.mode).toBe('queued');
    expect(usePendingStore.getState().pending).toHaveLength(1);
  });

  it('también guarda ante un 503 o un tiempo de espera agotado', async () => {
    marcajes.onPost('/marcaje').replyOnce(503);
    await timeRegistrationService();
    marcajes.onPost('/marcaje').timeout();
    sinConexion();
    await timeRegistrationService();
    expect(usePendingStore.getState().pending.map((p) => p.type)).toEqual(['entry', 'exit']);
  });

  it('alterna entrada y salida sin conexión y avisa cuando el día ya está completo', async () => {
    sinConexion();
    await timeRegistrationService();
    await timeRegistrationService();
    expect(usePendingStore.getState().pending.map((p) => p.type)).toEqual(['entry', 'exit']);
    expect(await timeRegistrationService()).toEqual({ success: false, message: 'Your day is already complete.' });
    expect(usePendingStore.getState().pending).toHaveLength(2);
  });

  it('parte del estado conocido del servidor: si ya había entrada, lo siguiente es la salida', async () => {
    usePendingStore.setState({ knownState: { userId: 7, day: diaLocal(), state: 1 } });
    sinConexion();
    await timeRegistrationService();
    expect(usePendingStore.getState().pending[0].type).toBe('exit');
  });

  it('con registros pendientes los nuevos también se encolan para conservar el orden y se envían en orden', async () => {
    sinConexion();
    await timeRegistrationService();
    await vaciarCola();
    conConexion();
    marcajes.reset();
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    await timeRegistrationService();
    await vaciarCola();
    await vaciarCola();
    const enviados = cuerpos();
    expect(enviados).toHaveLength(2);
    expect(enviados.every((c) => c.recordedAt && c.clientId)).toBe(true);
    expect(new Date(enviados[0].recordedAt).getTime()).toBeLessThanOrEqual(new Date(enviados[1].recordedAt).getTime());
    expect(usePendingStore.getState().pending).toHaveLength(0);
  });
});

describe('ubicación', () => {
  it('exige el permiso', async () => {
    permiso.mockResolvedValue({ status: 'denied' });
    expect(await timeRegistrationService()).toEqual({
      success: false,
      message: 'Location permission is required to register your time.',
    });
    expect(marcajes.history.post).toHaveLength(0);
  });

  it('usa la última ubicación conocida cuando no se puede obtener la actual', async () => {
    actual.mockRejectedValue(new Error('sin GPS'));
    ultima.mockResolvedValue({ coords: { latitude: 1.5, longitude: 2.5 } });
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    await timeRegistrationService();
    expect(cuerpos()[0]).toEqual({ latCoordinate: '1.5', longCoordinate: '2.5' });
  });

  it('falla si no hay ninguna ubicación disponible', async () => {
    actual.mockRejectedValue(new Error('sin GPS'));
    ultima.mockResolvedValue(null);
    expect((await timeRegistrationService()).success).toBe(false);
  });

  it('falla si pedir el permiso lanza un error', async () => {
    permiso.mockRejectedValue(new Error('error'));
    expect((await timeRegistrationService()).success).toBe(false);
  });
});

describe('syncPending', () => {
  const cola = (...items: PendingRegistration[]) => usePendingStore.setState({ pending: items });

  it('no hace nada sin una sesión', async () => {
    useUserStore.getState().clearUser();
    cola(pendiente());
    expect(await syncPending()).toEqual({ sent: 0, rejected: 0, remaining: 0 });
    expect(marcajes.history.post).toHaveLength(0);
  });

  it('envía en orden con la hora y el identificador, y elimina lo enviado', async () => {
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    cola(
      pendiente({ clientId: 'a', recordedAt: '2026-10-26T12:00:00.000Z' }),
      pendiente({ clientId: 'b', type: 'exit', recordedAt: '2026-10-26T20:00:00.000Z' }),
    );
    expect(await syncPending()).toEqual({ sent: 2, rejected: 0, remaining: 0 });
    expect(cuerpos()).toEqual([
      { latCoordinate: '-33.44', longCoordinate: '-70.66', recordedAt: '2026-10-26T12:00:00.000Z', clientId: 'a' },
      { latCoordinate: '-33.44', longCoordinate: '-70.66', recordedAt: '2026-10-26T20:00:00.000Z', clientId: 'b' },
    ]);
    expect(usePendingStore.getState().pending).toEqual([]);
  });

  it('actualiza el estado conocido cuando se envía un registro de hoy', async () => {
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('exit') });
    cola(pendiente({ type: 'exit', recordedAt: new Date().toISOString() }));
    await syncPending();
    expect(usePendingStore.getState().knownState).toEqual({ userId: 7, day: diaLocal(), state: 2 });
  });

  it('no toca el estado conocido al enviar registros de otro día', async () => {
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    cola(pendiente({ recordedAt: '2020-01-01T12:00:00.000Z' }));
    await syncPending();
    expect(usePendingStore.getState().knownState).toBeNull();
  });

  it('mueve a rechazados lo que el servidor rechaza por reglas de negocio y sigue con el resto', async () => {
    marcajes.onPost('/marcaje').replyOnce(201, { success: false, message: 'Entry and exit already registered for today' });
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    cola(pendiente({ clientId: 'a' }), pendiente({ clientId: 'b' }));
    expect(await syncPending()).toEqual({ sent: 1, rejected: 1, remaining: 0 });
    expect(usePendingStore.getState().rejected).toEqual([
      expect.objectContaining({ clientId: 'a', message: 'Entry and exit already registered for today' }),
    ]);
  });

  it('rechaza definitivamente un error de validación del servidor', async () => {
    marcajes.onPost('/marcaje').reply(400, { message: ['recordedAt must be a valid ISO 8601 date string'] });
    cola(pendiente());
    expect(await syncPending()).toEqual({ sent: 0, rejected: 1, remaining: 0 });
    expect(usePendingStore.getState().rejected[0].message).toMatch(/ISO 8601/);
  });

  it.each([[503], [502], [504], [429]])('conserva lo pendiente y se detiene ante un %i', async (estado) => {
    marcajes.onPost('/marcaje').reply(estado);
    cola(pendiente({ clientId: 'a' }), pendiente({ clientId: 'b' }));
    expect(await syncPending()).toEqual({ sent: 0, rejected: 0, remaining: 2 });
    expect(marcajes.history.post).toHaveLength(1);
  });

  it('conserva lo pendiente cuando no hay conexión', async () => {
    marcajes.onPost('/marcaje').networkError();
    cola(pendiente());
    expect((await syncPending()).remaining).toBe(1);
  });

  it('conserva lo pendiente cuando la sesión venció, para enviarlo tras volver a ingresar', async () => {
    marcajes.onPost('/marcaje').reply(401);
    cola(pendiente({ clientId: 'a' }), pendiente({ clientId: 'b' }));
    expect(await syncPending()).toEqual({ sent: 0, rejected: 0, remaining: 2 });
    expect(marcajes.history.post).toHaveLength(1);
  });

  it('se detiene al primer fallo reintentable pero conserva lo ya enviado', async () => {
    marcajes.onPost('/marcaje').replyOnce(201, { success: true, data: marca('entry') });
    marcajes.onPost('/marcaje').reply(503);
    cola(pendiente({ clientId: 'a' }), pendiente({ clientId: 'b', type: 'exit' }), pendiente({ clientId: 'c' }));
    expect(await syncPending()).toEqual({ sent: 1, rejected: 0, remaining: 2 });
  });

  it('solo envía los registros del usuario con la sesión abierta', async () => {
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    cola(pendiente({ clientId: 'mio' }), pendiente({ clientId: 'ajeno', userId: 99 }));
    await syncPending();
    expect(cuerpos().map((c) => c.clientId)).toEqual(['mio']);
    expect(usePendingStore.getState().pending.map((p) => p.clientId)).toEqual(['ajeno']);
  });

  it('una segunda llamada simultánea no duplica los envíos', async () => {
    let liberar: () => void = () => undefined;
    const iniciado = new Promise<void>((resolver) => {
      marcajes.onPost('/marcaje').reply(
        () =>
          new Promise((respuesta) => {
            liberar = () => respuesta([201, { success: true, data: marca('entry') }]);
            resolver();
          }),
      );
    });
    cola(pendiente());
    const primera = syncPending();
    await iniciado;
    const segunda = await syncPending();
    expect(segunda.remaining).toBe(1);
    liberar();
    await primera;
    expect(marcajes.history.post).toHaveLength(1);
  });

  it('un reintento tras una respuesta perdida reenvía el mismo identificador', async () => {
    marcajes.onPost('/marcaje').replyOnce(503);
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca('entry') });
    cola(pendiente({ clientId: 'unico' }));
    await syncPending();
    await syncPending();
    expect(cuerpos().map((c) => c.clientId)).toEqual(['unico', 'unico']);
    expect(usePendingStore.getState().pending).toEqual([]);
  });
});
