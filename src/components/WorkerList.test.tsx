import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { WorkerList } from './WorkerList';
import { useWorkers } from '../hooks/useWorkers';

type Trabajadores = ReturnType<typeof useWorkers>;

const usuario = (id: number, nombre: string) => ({
  id,
  firstName: nombre,
  lastName: 'Soto',
  email: `${nombre.toLowerCase()}@test.cl`,
  birthday: '1990-01-01',
});

const base = (extra: Partial<Trabajadores> = {}): Trabajadores => ({
  search: '',
  setSearch: jest.fn(),
  items: [usuario(1, 'Carlos'), usuario(2, 'Paula')],
  total: 2,
  loading: false,
  loadingMore: false,
  error: null,
  status: {},
  hasMore: false,
  loadMore: jest.fn(),
  reload: jest.fn(),
  ...extra,
});

describe('WorkerList', () => {
  it('muestra a todos los trabajadores con el conteo y el estado de hoy', () => {
    render(
      <WorkerList
        workers={base({
          status: {
            1: { idUser: 1, state: 'working', checkIn: '11-03-2024 09:00:00', checkOut: null },
            2: { idUser: 2, state: 'done', checkIn: '11-03-2024 08:00:00', checkOut: '11-03-2024 16:00:00' },
          },
        })}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText('Carlos Soto')).toBeTruthy();
    expect(screen.getByText('Paula Soto')).toBeTruthy();
    expect(screen.getByText('Showing 2 of 2 workers')).toBeTruthy();
    expect(screen.getByText('Working now')).toBeTruthy();
    expect(screen.getByText('Done today')).toBeTruthy();
  });

  it('indica cuando alguien no tiene actividad hoy', () => {
    render(<WorkerList workers={base()} onSelect={jest.fn()} />);
    expect(screen.getAllByText('No activity today')).toHaveLength(2);
  });

  it('avisa al elegir un trabajador', () => {
    const alElegir = jest.fn();
    render(<WorkerList workers={base()} onSelect={alElegir} />);
    fireEvent.press(screen.getByLabelText('Paula Soto'));
    expect(alElegir).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('actualiza la búsqueda al escribir', () => {
    const setSearch = jest.fn();
    render(<WorkerList workers={base({ setSearch })} onSelect={jest.fn()} />);
    fireEvent.changeText(screen.getByLabelText('Search workers'), 'car');
    expect(setSearch).toHaveBeenCalledWith('car');
  });

  it('ofrece cargar más cuando quedan trabajadores', () => {
    const loadMore = jest.fn();
    render(<WorkerList workers={base({ hasMore: true, total: 40, loadMore })} onSelect={jest.fn()} />);
    expect(screen.getByText('Showing 2 of 40 workers')).toBeTruthy();
    fireEvent.press(screen.getByText('Load more'));
    expect(loadMore).toHaveBeenCalled();
  });

  it('marca la selección cuando se puede comparar', () => {
    render(<WorkerList workers={base()} onSelect={jest.fn()} selectedIds={[1]} />);
    expect(screen.getByText('Carlos Soto')).toBeTruthy();
  });

  it('distingue entre no haber trabajadores y no encontrar resultados', () => {
    const { rerender } = render(
      <WorkerList workers={base({ items: [], total: 0 })} onSelect={jest.fn()} />,
    );
    expect(screen.getByText('No workers yet')).toBeTruthy();
    rerender(<WorkerList workers={base({ items: [], total: 0, search: 'zzz' })} onSelect={jest.fn()} />);
    expect(screen.getByText('No results')).toBeTruthy();
  });

  it('muestra el error y permite reintentar', () => {
    const reload = jest.fn();
    render(<WorkerList workers={base({ items: [], total: 0, error: 'Server error. Try again later.', reload })} onSelect={jest.fn()} />);
    expect(screen.getByText('Server error. Try again later.')).toBeTruthy();
    fireEvent.press(screen.getByText('Try again'));
    expect(reload).toHaveBeenCalled();
  });

  it('muestra el indicador mientras carga', () => {
    render(<WorkerList workers={base({ items: [], total: 0, loading: true })} onSelect={jest.fn()} />);
    expect(screen.getByLabelText('Loading workers')).toBeTruthy();
  });
});
