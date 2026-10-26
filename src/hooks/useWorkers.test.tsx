import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useWorkers } from './useWorkers';
import { searchWorkerService, teamStatusService } from '../services/searchWorker.service';

jest.mock('../services/searchWorker.service');

const buscar = searchWorkerService as jest.MockedFunction<typeof searchWorkerService>;
const estado = teamStatusService as jest.MockedFunction<typeof teamStatusService>;

const usuario = (id: number) => ({
  id,
  firstName: `Nombre${id}`,
  lastName: 'Apellido',
  email: `u${id}@test.cl`,
  birthday: '1990-01-01',
});
const pagina = (ids: number[], total: number, offset = 0) => ({
  success: true as const,
  data: { items: ids.map(usuario), total, limit: 20, offset },
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  estado.mockResolvedValue({ success: true, data: [] });
});

describe('useWorkers', () => {
  it('carga todos los trabajadores y el estado de hoy al abrir', async () => {
    buscar.mockResolvedValue(pagina([1, 2], 2));
    estado.mockResolvedValue({
      success: true,
      data: [{ idUser: 1, state: 'working', checkIn: '11-03-2024 09:00:00', checkOut: null }],
    });
    const { result } = renderHook(() => useWorkers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(buscar).toHaveBeenCalledWith('', 0);
    expect(result.current.items.map((u) => u.id)).toEqual([1, 2]);
    expect(result.current.total).toBe(2);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.status[1].state).toBe('working');
  });

  it('busca con una espera para no consultar en cada tecla', async () => {
    jest.useFakeTimers();
    buscar.mockResolvedValue(pagina([1], 1));
    const { result } = renderHook(() => useWorkers());
    await act(async () => {
      jest.advanceTimersByTime(10);
    });
    buscar.mockClear();
    act(() => result.current.setSearch('a'));
    act(() => result.current.setSearch('an'));
    act(() => result.current.setSearch('ana'));
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(buscar).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar).toHaveBeenCalledWith('ana', 0);
  });

  it('carga más resultados y los agrega', async () => {
    buscar.mockResolvedValueOnce(pagina([1, 2], 3));
    const { result } = renderHook(() => useWorkers());
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    buscar.mockResolvedValueOnce(pagina([3], 3, 2));
    await act(async () => result.current.loadMore());
    expect(buscar).toHaveBeenLastCalledWith('', 2);
    await waitFor(() => expect(result.current.items.map((u) => u.id)).toEqual([1, 2, 3]));
    expect(result.current.hasMore).toBe(false);
  });

  it('no pide más cuando ya está todo cargado', async () => {
    buscar.mockResolvedValue(pagina([1], 1));
    const { result } = renderHook(() => useWorkers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    buscar.mockClear();
    act(() => result.current.loadMore());
    expect(buscar).not.toHaveBeenCalled();
  });

  it('informa el error y permite reintentar', async () => {
    buscar.mockResolvedValueOnce({ success: false, message: 'Server error. Try again later.' });
    const { result } = renderHook(() => useWorkers());
    await waitFor(() => expect(result.current.error).toBe('Server error. Try again later.'));
    expect(result.current.items).toEqual([]);
    buscar.mockResolvedValue(pagina([1], 1));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.items).toHaveLength(1);
  });

  it('conserva lo ya cargado si falla una página siguiente', async () => {
    buscar.mockResolvedValueOnce(pagina([1], 2));
    const { result } = renderHook(() => useWorkers());
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    buscar.mockResolvedValueOnce({ success: false, message: 'Could not load the workers.' });
    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.error).toBe('Could not load the workers.'));
    expect(result.current.items).toHaveLength(1);
  });

  it('ignora respuestas atrasadas de búsquedas anteriores', async () => {
    let resolverLenta: (valor: ReturnType<typeof pagina>) => void = () => undefined;
    buscar.mockImplementationOnce(() => new Promise((resolver) => (resolverLenta = resolver)));
    const { result } = renderHook(() => useWorkers());
    buscar.mockResolvedValue(pagina([9], 1));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.items.map((u) => u.id)).toEqual([9]));
    await act(async () => resolverLenta(pagina([1, 2, 3], 3)));
    expect(result.current.items.map((u) => u.id)).toEqual([9]);
  });
});
