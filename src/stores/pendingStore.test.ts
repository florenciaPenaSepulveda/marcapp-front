import usePendingStore, { PendingRegistration } from './pendingStore';
import useConnectivityStore from './connectivityStore';

const item = (clientId: string, userId = 7): PendingRegistration => ({
  clientId,
  userId,
  recordedAt: '2026-10-26T12:00:00.000Z',
  latCoordinate: '-33.44',
  longCoordinate: '-70.66',
  type: 'entry',
});

beforeEach(() => {
  usePendingStore.setState({ pending: [], rejected: [], knownState: null });
});

describe('pendingStore', () => {
  it('encola en orden de llegada', () => {
    usePendingStore.getState().enqueue(item('a'));
    usePendingStore.getState().enqueue(item('b'));
    expect(usePendingStore.getState().pending.map((p) => p.clientId)).toEqual(['a', 'b']);
  });

  it('elimina un pendiente por identificador', () => {
    usePendingStore.setState({ pending: [item('a'), item('b')] });
    usePendingStore.getState().remove('a');
    expect(usePendingStore.getState().pending.map((p) => p.clientId)).toEqual(['b']);
  });

  it('rechazar mueve el registro a rechazados con el motivo', () => {
    usePendingStore.setState({ pending: [item('a'), item('b')] });
    usePendingStore.getState().reject(item('a'), 'Entry and exit already registered for today');
    const { pending, rejected } = usePendingStore.getState();
    expect(pending.map((p) => p.clientId)).toEqual(['b']);
    expect(rejected).toEqual([
      {
        clientId: 'a',
        userId: 7,
        recordedAt: '2026-10-26T12:00:00.000Z',
        type: 'entry',
        message: 'Entry and exit already registered for today',
      },
    ]);
  });

  it('descartar los rechazados solo afecta al usuario indicado', () => {
    usePendingStore.setState({ pending: [item('a'), item('b', 9)] });
    usePendingStore.getState().reject(item('a'), 'x');
    usePendingStore.getState().reject(item('b', 9), 'y');
    usePendingStore.getState().dismissRejected(7);
    expect(usePendingStore.getState().rejected.map((r) => r.userId)).toEqual([9]);
  });

  it('guarda el último estado conocido del día', () => {
    usePendingStore.getState().setKnownState({ userId: 7, day: '2026-10-26', state: 1 });
    expect(usePendingStore.getState().knownState).toEqual({ userId: 7, day: '2026-10-26', state: 1 });
  });
});

describe('connectivityStore', () => {
  it('parte en línea y cambia con setOnline', () => {
    expect(useConnectivityStore.getState().online).toBe(true);
    useConnectivityStore.getState().setOnline(false);
    expect(useConnectivityStore.getState().online).toBe(false);
    useConnectivityStore.getState().setOnline(true);
  });
});
