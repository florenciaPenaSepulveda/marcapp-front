import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { act, renderHook } from '@testing-library/react-native';
import { INTERVALO_DE_REINTENTO_MS, useSyncEngine, useSyncStatus } from './useSync';
import { syncPending } from '../services/sync.service';
import usePendingStore, { PendingRegistration } from '../stores/pendingStore';
import useConnectivityStore from '../stores/connectivityStore';
import useUserStore from '../stores/useStore';

jest.mock('../services/sync.service');

const sincronizar = syncPending as jest.MockedFunction<typeof syncPending>;
const agregarEscucha = NetInfo.addEventListener as jest.Mock;

const item = (clientId: string, userId = 7): PendingRegistration => ({
  clientId,
  userId,
  recordedAt: '2026-10-26T12:00:00.000Z',
  latCoordinate: '1',
  longCoordinate: '2',
  type: 'entry',
});

let cambiarEstadoDeLaApp: (estado: string) => void = () => undefined;
let desuscribirApp: jest.Mock;
let desuscribirRed: jest.Mock;
let alCambiarLaRed: (estado: { isConnected: boolean | null; isInternetReachable: boolean | null }) => void;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  sincronizar.mockResolvedValue({ sent: 0, rejected: 0, remaining: 0 });
  usePendingStore.setState({ pending: [], rejected: [], knownState: null });
  useConnectivityStore.setState({ online: true });
  useUserStore.getState().clearUser();
  desuscribirApp = jest.fn();
  desuscribirRed = jest.fn();
  agregarEscucha.mockImplementation((escucha) => {
    alCambiarLaRed = escucha;
    return desuscribirRed;
  });
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((_evento: string, escucha: (e: string) => void) => {
    cambiarEstadoDeLaApp = escucha;
    return { remove: desuscribirApp };
  }) as never);
});

describe('useSyncEngine', () => {
  it('al volver la conexión actualiza el estado y sincroniza', () => {
    renderHook(() => useSyncEngine());
    useConnectivityStore.setState({ online: false });
    act(() => alCambiarLaRed({ isConnected: true, isInternetReachable: true }));
    expect(useConnectivityStore.getState().online).toBe(true);
    expect(sincronizar).toHaveBeenCalled();
  });

  it('al perder la conexión lo registra y no intenta sincronizar', () => {
    renderHook(() => useSyncEngine());
    sincronizar.mockClear();
    act(() => alCambiarLaRed({ isConnected: false, isInternetReachable: false }));
    expect(useConnectivityStore.getState().online).toBe(false);
    expect(sincronizar).not.toHaveBeenCalled();
  });

  it('sincroniza al volver a la app desde segundo plano, pero no al salir de ella', () => {
    renderHook(() => useSyncEngine());
    sincronizar.mockClear();
    act(() => cambiarEstadoDeLaApp('background'));
    expect(sincronizar).not.toHaveBeenCalled();
    act(() => cambiarEstadoDeLaApp('active'));
    expect(sincronizar).toHaveBeenCalledTimes(1);
  });

  it('sincroniza al iniciar sesión', () => {
    renderHook(() => useSyncEngine());
    sincronizar.mockClear();
    act(() => useUserStore.getState().setId(7));
    expect(sincronizar).toHaveBeenCalled();
  });

  it('reintenta periódicamente solo mientras haya registros pendientes', () => {
    jest.useFakeTimers();
    useUserStore.getState().setId(7);
    const { unmount } = renderHook(() => useSyncEngine());
    sincronizar.mockClear();
    act(() => jest.advanceTimersByTime(INTERVALO_DE_REINTENTO_MS * 2));
    expect(sincronizar).not.toHaveBeenCalled();

    act(() => usePendingStore.setState({ pending: [item('a')] }));
    sincronizar.mockClear();
    act(() => jest.advanceTimersByTime(INTERVALO_DE_REINTENTO_MS * 2));
    expect(sincronizar).toHaveBeenCalledTimes(2);

    act(() => usePendingStore.setState({ pending: [] }));
    sincronizar.mockClear();
    act(() => jest.advanceTimersByTime(INTERVALO_DE_REINTENTO_MS * 2));
    expect(sincronizar).not.toHaveBeenCalled();
    unmount();
  });

  it('libera las suscripciones al desmontar', () => {
    const { unmount } = renderHook(() => useSyncEngine());
    unmount();
    expect(desuscribirRed).toHaveBeenCalled();
    expect(desuscribirApp).toHaveBeenCalled();
  });
});

describe('useSyncEngine en el navegador', () => {
  const original = Platform.OS;
  const escuchas: Record<string, () => void> = {};
  let ventana: { addEventListener: jest.Mock; removeEventListener: jest.Mock };

  beforeEach(() => {
    Platform.OS = 'web';
    ventana = {
      addEventListener: jest.fn((evento: string, escucha: () => void) => {
        escuchas[evento] = escucha;
      }),
      removeEventListener: jest.fn(),
    };
    (globalThis as unknown as { window: unknown }).window = ventana;
  });

  afterEach(() => {
    Platform.OS = original;
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('detecta los eventos de conexión del navegador, que NetInfo no emite en web', () => {
    renderHook(() => useSyncEngine());
    sincronizar.mockClear();
    Object.defineProperty(globalThis.navigator, 'onLine', { value: false, configurable: true });
    act(() => escuchas.offline());
    expect(useConnectivityStore.getState().online).toBe(false);
    expect(sincronizar).not.toHaveBeenCalled();
    Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true });
    act(() => escuchas.online());
    expect(useConnectivityStore.getState().online).toBe(true);
    expect(sincronizar).toHaveBeenCalled();
  });

  it('retira los escuchas al desmontar', () => {
    const { unmount } = renderHook(() => useSyncEngine());
    unmount();
    expect(ventana.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(ventana.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

describe('useSyncStatus', () => {
  beforeEach(() => {
    useUserStore.getState().setId(7);
  });

  it('entrega solo lo pendiente y rechazado del usuario con la sesión abierta', () => {
    usePendingStore.setState({
      pending: [item('mio'), item('ajeno', 9)],
      rejected: [
        { clientId: 'r1', userId: 7, recordedAt: '2026-10-26T12:00:00.000Z', type: 'entry', message: 'm' },
        { clientId: 'r2', userId: 9, recordedAt: '2026-10-26T12:00:00.000Z', type: 'entry', message: 'm' },
      ],
    });
    const { result } = renderHook(() => useSyncStatus());
    expect(result.current.pending.map((p) => p.clientId)).toEqual(['mio']);
    expect(result.current.rejected.map((r) => r.clientId)).toEqual(['r1']);
    expect(result.current.online).toBe(true);
  });

  it('syncNow indica que está sincronizando mientras dura y luego lo apaga', async () => {
    let terminar: () => void = () => undefined;
    sincronizar.mockImplementation(() => new Promise((resolver) => (terminar = () => resolver({ sent: 1, rejected: 0, remaining: 0 }))));
    const { result } = renderHook(() => useSyncStatus());
    let promesa: Promise<void> = Promise.resolve();
    act(() => {
      promesa = result.current.syncNow();
    });
    expect(result.current.syncing).toBe(true);
    await act(async () => {
      terminar();
      await promesa;
    });
    expect(result.current.syncing).toBe(false);
  });

  it('dismiss elimina los rechazados del usuario', () => {
    usePendingStore.setState({
      rejected: [{ clientId: 'r1', userId: 7, recordedAt: '2026-10-26T12:00:00.000Z', type: 'exit', message: 'm' }],
    });
    const { result } = renderHook(() => useSyncStatus());
    act(() => result.current.dismiss());
    expect(result.current.rejected).toEqual([]);
  });
});
