import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import Login from './login';
import Home from './home';
import loginService from '../services/login.service';
import useUserStore from '../stores/useStore';
import { cerrarSesion } from '../session';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace }),
  createNavigationContainerRef: () => ({ isReady: () => false, reset: jest.fn() }),
}));
jest.mock('../services/login.service');
jest.mock('../session', () => ({ cerrarSesion: jest.fn(), haySesion: jest.fn() }));

const metricas = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const conProveedor = (ui: React.ReactElement) =>
  render(<NativeBaseProvider initialWindowMetrics={metricas}>{ui}</NativeBaseProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  useUserStore.getState().clearUser();
});

describe('Login', () => {
  const login = loginService as jest.MockedFunction<typeof loginService>;

  it('valida el correo y la contraseña antes de llamar al servidor', () => {
    conProveedor(<Login />);
    fireEvent.press(screen.getByText('Login'));
    expect(screen.getByText('Email is required.')).toBeTruthy();
    expect(screen.getByText('Password is required.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('rechaza un correo con formato inválido', () => {
    conProveedor(<Login />);
    fireEvent.changeText(screen.getByPlaceholderText('mail@example.cl'), 'sin-arroba');
    fireEvent.changeText(screen.getByPlaceholderText('********'), 'Clave12345');
    fireEvent.press(screen.getByText('Login'));
    expect(screen.getByText('Enter a valid email.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor y no navega', async () => {
    login.mockResolvedValue({ success: false, message: 'Invalid credentials or expired session.' });
    conProveedor(<Login />);
    fireEvent.changeText(screen.getByPlaceholderText('mail@example.cl'), 'ana@test.cl');
    fireEvent.changeText(screen.getByPlaceholderText('********'), 'mala');
    fireEvent.press(screen.getByText('Login'));
    expect(await screen.findByText('Invalid credentials or expired session.')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('ingresa, limpia la contraseña y abre Home', async () => {
    login.mockResolvedValue({ success: true, data: undefined });
    conProveedor(<Login />);
    fireEvent.changeText(screen.getByPlaceholderText('mail@example.cl'), 'ana@test.cl');
    fireEvent.changeText(screen.getByPlaceholderText('********'), 'Clave12345');
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('Home'));
    expect(login).toHaveBeenCalledWith({ email: 'ana@test.cl', password: 'Clave12345' });
  });

  it('lleva al registro', () => {
    conProveedor(<Login />);
    fireEvent.press(screen.getByText('Sign Up'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});

describe('Home', () => {
  it('un usuario común solo ve sus opciones', () => {
    useUserStore.getState().setFirstName('Ana');
    useUserStore.getState().setRole('user');
    conProveedor(<Home />);
    expect(screen.getByText(/Nice to see you again on MarcApp, Ana!/)).toBeTruthy();
    expect(screen.getByText('View Profile')).toBeTruthy();
    expect(screen.getByText('Add Time Registration')).toBeTruthy();
    expect(screen.queryByText('Search worker')).toBeNull();
    expect(screen.queryByText('View Graphics')).toBeNull();
  });

  it('el administrador ve las opciones de administración y navega', () => {
    useUserStore.getState().setRole('admin');
    conProveedor(<Home />);
    fireEvent.press(screen.getByText('Search worker'));
    expect(mockNavigate).toHaveBeenCalledWith('SearchWorker');
    fireEvent.press(screen.getByText('View Graphics'));
    expect(mockNavigate).toHaveBeenCalledWith('ViewGraphics');
  });

  it('permite cerrar sesión', () => {
    conProveedor(<Home />);
    fireEvent.press(screen.getByText('Log out'));
    expect(cerrarSesion).toHaveBeenCalled();
  });
});
