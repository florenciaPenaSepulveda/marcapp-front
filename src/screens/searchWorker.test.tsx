import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import SearchWorker from './searchWorker';
import { useWorkers } from '../hooks/useWorkers';
import weeklySummaryService from '../services/weeklySummary.service';
import {
  addTimeRegistrationService,
  deleteWorkerService,
  summaryService,
} from '../services/searchWorker.service';
import useUserStore from '../stores/useStore';

jest.mock('../hooks/useWorkers');
jest.mock('../services/weeklySummary.service');
jest.mock('../services/searchWorker.service');

const usuario = (id: number, nombre: string) => ({
  id,
  firstName: nombre,
  lastName: 'Soto',
  email: `${nombre.toLowerCase()}@test.cl`,
  birthday: '1990-01-01',
});

const reload = jest.fn();
const navigate = jest.fn();
const navigation = { navigate } as never;

const trabajadores = () => ({
  search: '',
  setSearch: jest.fn(),
  items: [usuario(1, 'Admin'), usuario(2, 'Carlos')],
  total: 2,
  loading: false,
  loadingMore: false,
  error: null,
  status: {},
  hasMore: false,
  loadMore: jest.fn(),
  reload,
});

const marca = (id: number, type: 'entry' | 'exit', date: string) => ({
  id,
  id_user: 2,
  date,
  type,
  adminFlag: false,
  latCoordinate: '-33.4',
  longCoordinate: '-70.6',
});

const hoy = (hora: string) => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${hora}`;
};

beforeEach(() => {
  jest.clearAllMocks();
  useUserStore.getState().clearUser();
  useUserStore.getState().setId(1);
  (useWorkers as jest.Mock).mockReturnValue(trabajadores());
  (weeklySummaryService as jest.Mock).mockResolvedValue({
    success: true,
    data: [marca(10, 'entry', hoy('09:00:00'))],
  });
  (summaryService as jest.Mock).mockResolvedValue({
    success: true,
    data: { from: '', to: '', daysWorked: 3, totalHours: 24, averageHoursPerDay: 8, incompleteDays: 1, perUser: [] },
  });
});

const abrirCarlos = async () => {
  render(<SearchWorker navigation={navigation} />);
  fireEvent.press(screen.getByLabelText('Carlos Soto'));
  await screen.findByText('This week');
};

describe('SearchWorker', () => {
  it('al tocar un trabajador abre su detalle con el resumen del mes y los marcajes', async () => {
    await abrirCarlos();
    expect(weeklySummaryService).toHaveBeenCalledWith(expect.any(String), expect.any(String), 2);
    expect(await screen.findByText('24h 00m')).toBeTruthy();
    expect(screen.getByText('Days')).toBeTruthy();
    expect(screen.getByText(/Location: -33.4, -70.6/)).toBeTruthy();
    expect(screen.getByText(/Missing check-out on/)).toBeTruthy();
  });

  it('abre la edición de un marcaje', async () => {
    await abrirCarlos();
    fireEvent.press(screen.getByLabelText(`Edit entry ${hoy('09:00:00')}`));
    expect(navigate).toHaveBeenCalledWith('EditTimeRegistration', {
      id: '10',
      date: hoy('09:00:00'),
      type: 'entry',
    });
  });

  it('valida la fecha antes de agregar un marcaje', async () => {
    await abrirCarlos();
    fireEvent.changeText(screen.getByLabelText('Date and time'), 'mal');
    fireEvent.press(screen.getByText('Add registration'));
    expect(await screen.findByText('Use the format DD-MM-YYYY HH:mm:ss.')).toBeTruthy();
    expect(addTimeRegistrationService).not.toHaveBeenCalled();
  });

  it('agrega un marcaje y recarga la lista', async () => {
    (addTimeRegistrationService as jest.Mock).mockResolvedValue({ success: true, data: marca(11, 'exit', hoy('17:00:00')) });
    await abrirCarlos();
    fireEvent.changeText(screen.getByLabelText('Date and time'), hoy('17:00:00'));
    fireEvent.press(screen.getByText('Add registration'));
    expect(await screen.findByText('Time registration added.')).toBeTruthy();
    expect(addTimeRegistrationService).toHaveBeenCalledWith(hoy('17:00:00'), 2);
    expect(reload).toHaveBeenCalled();
  });

  it('muestra el error del servidor al agregar', async () => {
    (addTimeRegistrationService as jest.Mock).mockResolvedValue({ success: false, message: 'The date cannot be in the future' });
    await abrirCarlos();
    fireEvent.changeText(screen.getByLabelText('Date and time'), hoy('17:00:00'));
    fireEvent.press(screen.getByText('Add registration'));
    expect(await screen.findByText('The date cannot be in the future')).toBeTruthy();
  });

  it('no ofrece eliminar la propia cuenta', async () => {
    render(<SearchWorker navigation={navigation} />);
    fireEvent.press(screen.getByLabelText('Admin Soto'));
    await screen.findByText('This week');
    expect(screen.queryByText('Delete worker')).toBeNull();
  });

  it('pide confirmación antes de eliminar y permite cancelar', async () => {
    await abrirCarlos();
    fireEvent.press(screen.getByText('Delete worker'));
    expect(await screen.findByText('Delete this worker?')).toBeTruthy();
    fireEvent.press(screen.getByText('Cancel'));
    expect(deleteWorkerService).not.toHaveBeenCalled();
  });

  it('elimina al trabajador, avisa y recarga la lista', async () => {
    (deleteWorkerService as jest.Mock).mockResolvedValue({ success: true, data: { registrationsRemoved: true } });
    await abrirCarlos();
    fireEvent.press(screen.getByText('Delete worker'));
    fireEvent.press((await screen.findAllByText('Delete worker')).slice(-1)[0]);
    expect(await screen.findByText('Carlos Soto was deleted.')).toBeTruthy();
    expect(deleteWorkerService).toHaveBeenCalledWith(2);
    expect(reload).toHaveBeenCalled();
  });

  it('advierte cuando no se pudieron eliminar sus marcajes', async () => {
    (deleteWorkerService as jest.Mock).mockResolvedValue({ success: true, data: { registrationsRemoved: false } });
    await abrirCarlos();
    fireEvent.press(screen.getByText('Delete worker'));
    fireEvent.press((await screen.findAllByText('Delete worker')).slice(-1)[0]);
    expect(await screen.findByText(/time registrations could not be removed/)).toBeTruthy();
  });

  it('muestra el error si el servidor rechaza la eliminación', async () => {
    (deleteWorkerService as jest.Mock).mockResolvedValue({ success: false, message: 'You cannot delete the last administrator' });
    await abrirCarlos();
    fireEvent.press(screen.getByText('Delete worker'));
    fireEvent.press((await screen.findAllByText('Delete worker')).slice(-1)[0]);
    await waitFor(() => expect(screen.getByText('You cannot delete the last administrator')).toBeTruthy());
    expect(reload).not.toHaveBeenCalled();
  });

  it('muestra el error si no se pueden cargar los marcajes', async () => {
    (weeklySummaryService as jest.Mock).mockResolvedValue({ success: false, message: 'Server error. Try again later.' });
    (summaryService as jest.Mock).mockResolvedValue({ success: false, message: 'x' });
    render(<SearchWorker navigation={navigation} />);
    fireEvent.press(screen.getByLabelText('Carlos Soto'));
    expect(await screen.findByText('Server error. Try again later.')).toBeTruthy();
    expect(screen.queryByText('No registrations this week')).toBeNull();
  });
});
