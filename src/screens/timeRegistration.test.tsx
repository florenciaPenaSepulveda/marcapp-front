import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import TimeRegistration from './timeRegistration';
import timeRegistrationService from '../services/timeRegistration.service';
import getRegistrationStateService from '../services/getRegistrationStateService.service';
import usePendingStore, { PendingRegistration } from '../stores/pendingStore';
import useConnectivityStore from '../stores/connectivityStore';
import useUserStore from '../stores/useStore';
import { diaLocal } from '../lib/estadoLocal';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  createNavigationContainerRef: () => ({ isReady: () => false, reset: jest.fn() }),
}));
jest.mock('../services/timeRegistration.service');
jest.mock('../services/getRegistrationStateService.service');
jest.mock('../services/sync.service');

const registrar = timeRegistrationService as jest.Mock;
const estadoDelServidor = getRegistrationStateService as jest.Mock;

const pendiente = (type: 'entry' | 'exit'): PendingRegistration => ({
  clientId: `id-${type}`,
  userId: 7,
  recordedAt: new Date().toISOString(),
  latCoordinate: '1',
  longCoordinate: '2',
  type,
});

beforeEach(() => {
  jest.clearAllMocks();
  usePendingStore.setState({ pending: [], rejected: [], knownState: null });
  useConnectivityStore.setState({ online: true });
  useUserStore.getState().clearUser();
  useUserStore.getState().setId(7);
  useUserStore.getState().setFirstName('Ana');
  estadoDelServidor.mockResolvedValue({ success: false, message: 'Could not reach the server.' });
});

describe('TimeRegistration', () => {
  it('permite marcar la entrada aunque no se pueda consultar el estado al servidor', async () => {
    render(<TimeRegistration />);
    expect(screen.getByText('You have not checked in')).toBeTruthy();
    expect(screen.getByLabelText('Check in')).toBeTruthy();
    await waitFor(() => expect(estadoDelServidor).toHaveBeenCalledWith(7));
  });

  it('adopta el estado que informa el servidor', async () => {
    estadoDelServidor.mockResolvedValue({ success: true, data: 1 });
    render(<TimeRegistration />);
    expect(await screen.findByText('You are checked in')).toBeTruthy();
    expect(usePendingStore.getState().knownState).toEqual({ userId: 7, day: diaLocal(), state: 1 });
    expect(screen.getByLabelText('Check out')).toBeTruthy();
  });

  it('refleja un registro guardado en el teléfono: ofrece la salida', () => {
    usePendingStore.setState({ pending: [pendiente('entry')] });
    render(<TimeRegistration />);
    expect(screen.getByText('You are checked in')).toBeTruthy();
    expect(screen.getByLabelText('Check out')).toBeTruthy();
  });

  it('con entrada y salida pendientes el día queda completo y el botón se desactiva', () => {
    usePendingStore.setState({ pending: [pendiente('entry'), pendiente('exit')] });
    render(<TimeRegistration />);
    expect(screen.getByText('Your day is complete')).toBeTruthy();
    expect(screen.getByLabelText('Done').props.accessibilityState.disabled).toBe(true);
  });

  it('confirma un registro enviado en línea con la hora del servidor', async () => {
    registrar.mockResolvedValue({
      success: true,
      data: {
        mode: 'online',
        marca: { id: 1, id_user: 7, date: '26-10-2026 09:05:00', type: 'entry', adminFlag: false, latCoordinate: '1', longCoordinate: '2' },
      },
    });
    render(<TimeRegistration />);
    fireEvent.press(screen.getByLabelText('Check in'));
    expect(await screen.findByText('Ana, your check-in was registered at 09:05:00.')).toBeTruthy();
  });

  it('avisa que el registro quedó guardado en el teléfono cuando no hay señal', async () => {
    registrar.mockResolvedValue({ success: true, data: { mode: 'queued', pendiente: pendiente('entry') } });
    render(<TimeRegistration />);
    fireEvent.press(screen.getByLabelText('Check in'));
    expect(await screen.findByText(/No signal. Your check-in of \d{2}:\d{2} was saved on this device and will be sent automatically./)).toBeTruthy();
  });

  it('describe la salida guardada como check-out', async () => {
    registrar.mockResolvedValue({ success: true, data: { mode: 'queued', pendiente: pendiente('exit') } });
    render(<TimeRegistration />);
    fireEvent.press(screen.getByLabelText('Check in'));
    expect(await screen.findByText(/Your check-out of/)).toBeTruthy();
  });

  it('muestra el error cuando el servidor rechaza el registro', async () => {
    registrar.mockResolvedValue({ success: false, message: 'Location permission is required to register your time.' });
    render(<TimeRegistration />);
    fireEvent.press(screen.getByLabelText('Check in'));
    expect(await screen.findByText('Location permission is required to register your time.')).toBeTruthy();
  });

  it('muestra el aviso de conexión y los registros pendientes', () => {
    useConnectivityStore.setState({ online: false });
    usePendingStore.setState({ pending: [pendiente('entry')] });
    render(<TimeRegistration />);
    expect(screen.getByText(/You are offline/)).toBeTruthy();
    expect(screen.getByText('1 registration is waiting to be sent.')).toBeTruthy();
  });

  it('lleva al resumen semanal', () => {
    render(<TimeRegistration />);
    fireEvent.press(screen.getByText('View weekly summary'));
    expect(mockNavigate).toHaveBeenCalledWith('WeeklySummary');
  });
});
