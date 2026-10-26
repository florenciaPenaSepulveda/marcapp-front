import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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

beforeEach(() => {
  jest.clearAllMocks();
  useUserStore.getState().clearUser();
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
  it('un usuario común solo ve sus opciones', () => {
    useUserStore.getState().setFirstName('Ana');
    useUserStore.getState().setRole('user');
    render(<Home />);
    expect(screen.getByText(/Ana/)).toBeTruthy();
    expect(screen.getByText('Register time')).toBeTruthy();
    expect(screen.getByText('Weekly summary')).toBeTruthy();
    expect(screen.getByText('My profile')).toBeTruthy();
    expect(screen.queryByText('Workers')).toBeNull();
    expect(screen.queryByText('Statistics')).toBeNull();
  });

  it('el administrador ve las opciones de administración y navega', () => {
    useUserStore.getState().setRole('admin');
    render(<Home />);
    fireEvent.press(screen.getByLabelText('Workers'));
    expect(mockNavigate).toHaveBeenCalledWith('SearchWorker');
    fireEvent.press(screen.getByLabelText('Statistics'));
    expect(mockNavigate).toHaveBeenCalledWith('ViewGraphics');
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
