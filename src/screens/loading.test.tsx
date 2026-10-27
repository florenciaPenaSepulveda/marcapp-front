import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Loading from './loading';
import profileService from '../services/profile.service';
import useTokenStore from '../stores/tokenStore';
import useUserStore from '../stores/useStore';

const mockReplace = jest.fn();
const mockNavigation = { replace: mockReplace };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  createNavigationContainerRef: () => ({ isReady: () => false, reset: jest.fn() }),
}));
jest.mock('../services/profile.service');

const perfil = profileService as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  useTokenStore.setState({ token: '', hydrated: true });
  useUserStore.getState().clearUser();
  perfil.mockResolvedValue({ success: true, data: {} });
});

describe('Loading', () => {
  it('sin sesión guardada abre el ingreso sin consultar al servidor', async () => {
    render(<Loading />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('Login'));
    expect(perfil).not.toHaveBeenCalled();
  });

  it('con sesión y usuario guardados abre el inicio al instante, aunque no haya señal', async () => {
    useTokenStore.setState({ token: 'sesion' });
    useUserStore.getState().setId(7);
    perfil.mockReturnValue(new Promise(() => undefined));
    render(<Loading />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('Home'));
  });

  it('con sesión y usuario guardados actualiza el perfil en segundo plano', async () => {
    useTokenStore.setState({ token: 'sesion' });
    useUserStore.getState().setId(7);
    render(<Loading />);
    await waitFor(() => expect(perfil).toHaveBeenCalledTimes(1));
  });

  it('sin usuario guardado necesita el perfil del servidor antes de abrir el inicio', async () => {
    useTokenStore.setState({ token: 'sesion' });
    render(<Loading />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('Home'));
    expect(perfil).toHaveBeenCalled();
  });

  it('si el perfil falla por falta de conexión permite reintentar', async () => {
    useTokenStore.setState({ token: 'sesion' });
    perfil.mockResolvedValueOnce({ success: false, message: 'Could not reach the server. Check your connection.' });
    render(<Loading />);
    expect(await screen.findByText('Could not reach the server. Check your connection.')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    perfil.mockResolvedValueOnce({ success: true, data: {} });
    fireEvent.press(screen.getByText('Try again'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('Home'));
  });

  it('si el servidor revocó la sesión vuelve al ingreso', async () => {
    useTokenStore.setState({ token: 'sesion' });
    perfil.mockImplementation(async () => {
      useTokenStore.setState({ token: '' });
      return { success: false, message: 'Invalid credentials or expired session.' };
    });
    render(<Loading />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('Login'));
  });

  it('espera a que el almacenamiento seguro termine de cargar', async () => {
    useTokenStore.setState({ token: 'sesion', hydrated: false });
    useUserStore.getState().setId(7);
    render(<Loading />);
    await new Promise((resolver) => setTimeout(resolver, 20));
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
