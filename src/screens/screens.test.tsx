import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Login from './login';
import Home from './home';
import ChangePassword from './changePassword';
import loginService from '../services/login.service';
import changePasswordService from '../services/password.service';
import { summaryService, teamStatusService, userStatsService } from '../services/searchWorker.service';
import useUserStore from '../stores/useStore';
import { cerrarSesion } from '../session';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace, goBack: mockGoBack }),
  useFocusEffect: (efecto: () => void) => require('react').useEffect(efecto, []),
  createNavigationContainerRef: () => ({ isReady: () => false, reset: jest.fn() }),
}));
jest.mock('../services/login.service');
jest.mock('../services/password.service');
jest.mock('../services/searchWorker.service');
jest.mock('../session', () => ({ cerrarSesion: jest.fn(), haySesion: jest.fn() }));

const resumen = {
  from: '2024-03-01',
  to: '2024-03-31',
  daysWorked: 3,
  totalHours: 24.5,
  averageHoursPerDay: 8.17,
  incompleteDays: 0,
  perUser: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  useUserStore.getState().clearUser();
  (summaryService as jest.Mock).mockResolvedValue({ success: true, data: resumen });
  (teamStatusService as jest.Mock).mockResolvedValue({ success: true, data: [] });
  (userStatsService as jest.Mock).mockResolvedValue({
    success: true,
    data: { total: 5, admins: 1, workers: 4, newThisMonth: 1 },
  });
});

describe('Login', () => {
  const login = loginService as jest.MockedFunction<typeof loginService>;

  it('valida el correo y la contraseña antes de llamar al servidor', () => {
    render(<Login />);
    fireEvent.press(screen.getByText('Log in'));
    expect(screen.getByText('Email is required.')).toBeTruthy();
    expect(screen.getByText('Password is required.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('rechaza un correo con formato inválido', () => {
    render(<Login />);
    fireEvent.changeText(screen.getByPlaceholderText('mail@example.cl'), 'sin-arroba');
    fireEvent.changeText(screen.getByPlaceholderText('Your password'), 'Clave12345');
    fireEvent.press(screen.getByText('Log in'));
    expect(screen.getByText('Enter a valid email.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor y no navega', async () => {
    login.mockResolvedValue({ success: false, message: 'Invalid credentials or expired session.' });
    render(<Login />);
    fireEvent.changeText(screen.getByPlaceholderText('mail@example.cl'), 'ana@test.cl');
    fireEvent.changeText(screen.getByPlaceholderText('Your password'), 'mala');
    fireEvent.press(screen.getByText('Log in'));
    expect(await screen.findByText('Invalid credentials or expired session.')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('ingresa y abre Home', async () => {
    login.mockResolvedValue({ success: true, data: undefined });
    render(<Login />);
    fireEvent.changeText(screen.getByPlaceholderText('mail@example.cl'), 'ana@test.cl');
    fireEvent.changeText(screen.getByPlaceholderText('Your password'), 'Clave12345');
    fireEvent.press(screen.getByText('Log in'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('Home'));
    expect(login).toHaveBeenCalledWith({ email: 'ana@test.cl', password: 'Clave12345' });
  });

  it('permite mostrar y ocultar la contraseña', () => {
    render(<Login />);
    const campo = screen.getByPlaceholderText('Your password');
    expect(campo.props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByLabelText('Show password'));
    expect(screen.getByPlaceholderText('Your password').props.secureTextEntry).toBe(false);
  });

  it('lleva al registro', () => {
    render(<Login />);
    fireEvent.press(screen.getByText('Create an account'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});

describe('Home', () => {
  it('un trabajador ve sus opciones y el resumen de su mes', async () => {
    useUserStore.getState().setFirstName('Ana');
    useUserStore.getState().setRole('user');
    render(<Home />);
    expect(screen.getByText(/Ana/)).toBeTruthy();
    expect(screen.getByText('Register time')).toBeTruthy();
    expect(screen.getByText('Weekly summary')).toBeTruthy();
    expect(screen.getByText('My profile')).toBeTruthy();
    expect(screen.queryByText('Workers')).toBeNull();
    expect(screen.queryByText('Statistics')).toBeNull();
    expect(await screen.findByText('24h 30m')).toBeTruthy();
    expect(screen.getByText('Days worked')).toBeTruthy();
    expect(userStatsService).not.toHaveBeenCalled();
  });

  it('el administrador ve el panorama de hoy y las opciones de administración', async () => {
    useUserStore.getState().setRole('admin');
    (teamStatusService as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { idUser: 1, state: 'working', checkIn: '11-03-2024 09:00:00', checkOut: null },
        { idUser: 2, state: 'working', checkIn: '11-03-2024 09:10:00', checkOut: null },
        { idUser: 3, state: 'done', checkIn: '11-03-2024 08:00:00', checkOut: '11-03-2024 16:00:00' },
      ],
    });
    render(<Home />);
    expect(await screen.findByLabelText('Working now: 2')).toBeTruthy();
    expect(screen.getByLabelText('Done today: 1')).toBeTruthy();
    expect(screen.getByLabelText('Not in yet: 2')).toBeTruthy();
    expect(screen.getByText('5 registered')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Workers'));
    expect(mockNavigate).toHaveBeenCalledWith('SearchWorker');
    fireEvent.press(screen.getByLabelText('Statistics'));
    expect(mockNavigate).toHaveBeenCalledWith('ViewGraphics');
  });

  it('tolera que fallen las consultas del resumen', async () => {
    (summaryService as jest.Mock).mockResolvedValue({ success: false, message: 'Server error. Try again later.' });
    render(<Home />);
    expect(screen.getByText('Register time')).toBeTruthy();
    await waitFor(() => expect(summaryService).toHaveBeenCalled());
    expect(screen.queryByText('Days worked')).toBeNull();
  });

  it('navega a marcar la hora', () => {
    render(<Home />);
    fireEvent.press(screen.getByLabelText('Register time'));
    expect(mockNavigate).toHaveBeenCalledWith('TimeRegistration');
  });

  it('permite cerrar sesión', () => {
    render(<Home />);
    fireEvent.press(screen.getByText('Log out'));
    expect(cerrarSesion).toHaveBeenCalled();
  });
});

describe('ChangePassword', () => {
  const cambiar = changePasswordService as jest.MockedFunction<typeof changePasswordService>;

  const rellenar = (actual: string, nueva: string, confirmacion: string) => {
    fireEvent.changeText(screen.getByLabelText('Current password'), actual);
    fireEvent.changeText(screen.getByLabelText('New password'), nueva);
    fireEvent.changeText(screen.getByLabelText('Confirm new password'), confirmacion);
    fireEvent.press(screen.getByText('Update password'));
  };

  it('valida los tres campos antes de llamar al servidor', () => {
    render(<ChangePassword />);
    fireEvent.press(screen.getByText('Update password'));
    expect(screen.getByText('Enter your current password.')).toBeTruthy();
    expect(screen.getByText('Password must have between 8 and 72 characters.')).toBeTruthy();
    expect(cambiar).not.toHaveBeenCalled();
  });

  it('exige que la nueva sea distinta y que la confirmación coincida', () => {
    render(<ChangePassword />);
    rellenar('Clave12345', 'Clave12345', 'Otra12345');
    expect(screen.getByText('The new password must be different.')).toBeTruthy();
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    expect(cambiar).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor', async () => {
    cambiar.mockResolvedValue({ success: false, message: 'Invalid credentials or expired session.' });
    render(<ChangePassword />);
    rellenar('Incorrecta1', 'Nueva12345', 'Nueva12345');
    expect(await screen.findByText('Invalid credentials or expired session.')).toBeTruthy();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('actualiza la contraseña, avisa y vuelve al perfil', async () => {
    cambiar.mockResolvedValue({ success: true, data: undefined });
    render(<ChangePassword />);
    rellenar('Actual12345', 'Nueva12345', 'Nueva12345');
    expect(await screen.findByText('Password updated')).toBeTruthy();
    expect(cambiar).toHaveBeenCalledWith('Actual12345', 'Nueva12345');
    fireEvent.press(screen.getByText('OK'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('permite cancelar', () => {
    render(<ChangePassword />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
