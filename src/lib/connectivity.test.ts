import NetInfo from '@react-native-community/netinfo';
import { AxiosError } from 'axios';
import { esErrorReintentable, estaConectado, hayConexion } from './connectivity';

const errorHttp = (status?: number) =>
  new AxiosError(
    'fallo',
    status ? 'ERR_BAD_RESPONSE' : 'ERR_NETWORK',
    undefined,
    undefined,
    status
      ? { status, data: {}, statusText: '', headers: {}, config: { headers: {} } as never }
      : undefined,
  );

describe('hayConexion', () => {
  it.each([
    [{ isConnected: true, isInternetReachable: true }, true],
    [{ isConnected: true, isInternetReachable: null }, true],
    [{ isConnected: null, isInternetReachable: null }, true],
    [{ isConnected: false, isInternetReachable: false }, false],
    [{ isConnected: true, isInternetReachable: false }, false],
    [{ isConnected: false, isInternetReachable: true }, false],
  ])('%j', (estado, esperado) => {
    expect(hayConexion(estado)).toBe(esperado);
  });
});

describe('estaConectado', () => {
  it('consulta el estado actual de la red', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false, isInternetReachable: false });
    expect(await estaConectado()).toBe(false);
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: true, isInternetReachable: true });
    expect(await estaConectado()).toBe(true);
  });
});

describe('esErrorReintentable', () => {
  it('reintenta cuando no hay respuesta del servidor', () => {
    expect(esErrorReintentable(errorHttp())).toBe(true);
  });

  it.each([[429], [502], [503], [504]])('reintenta ante un %i', (estado) => {
    expect(esErrorReintentable(errorHttp(estado))).toBe(true);
  });

  it.each([[400], [401], [403], [404], [500]])('no reintenta ante un %i', (estado) => {
    expect(esErrorReintentable(errorHttp(estado))).toBe(false);
  });

  it('no reintenta errores que no son de red', () => {
    expect(esErrorReintentable(new Error('x'))).toBe(false);
  });
});
