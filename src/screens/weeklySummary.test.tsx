import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import moment from 'moment';
import WeeklySummary from './weeklySummary';
import weeklySummaryService from '../services/weeklySummary.service';
import usePendingStore, { PendingRegistration } from '../stores/pendingStore';
import useConnectivityStore from '../stores/connectivityStore';
import useUserStore from '../stores/useStore';

jest.mock('../services/weeklySummary.service');
jest.mock('../services/sync.service');

const resumen = weeklySummaryService as jest.Mock;

const hoy = (hora: string) => moment(`${moment().format('YYYY-MM-DD')} ${hora}`, 'YYYY-MM-DD HH:mm');

const pendiente = (type: 'entry' | 'exit', hora: string): PendingRegistration => ({
  clientId: `id-${type}`,
  userId: 7,
  recordedAt: hoy(hora).toISOString(),
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
  resumen.mockResolvedValue({ success: true, data: [] });
});

describe('WeeklySummary', () => {
  it('sin registros muestra el estado vacío', async () => {
    render(<WeeklySummary />);
    expect(await screen.findByText('No registrations this week')).toBeTruthy();
  });

  it('muestra los registros guardados en el teléfono como pendientes de envío y suma sus horas', async () => {
    usePendingStore.setState({ pending: [pendiente('entry', '08:00'), pendiente('exit', '16:30')] });
    render(<WeeklySummary />);
    expect(await screen.findByText('8h 30m', { exact: false })).toBeTruthy();
    expect(screen.getByText('Waiting to be sent')).toBeTruthy();
    expect(screen.getByText('08:00')).toBeTruthy();
    expect(screen.getByText('16:30')).toBeTruthy();
  });

  it('muestra los pendientes aunque el servidor no responda, con el aviso del error', async () => {
    resumen.mockResolvedValue({ success: false, message: 'Could not reach the server. Check your connection.' });
    usePendingStore.setState({ pending: [pendiente('entry', '08:00')] });
    render(<WeeklySummary />);
    expect(await screen.findByText('Could not reach the server. Check your connection.')).toBeTruthy();
    expect(screen.getByText('Waiting to be sent')).toBeTruthy();
    expect(screen.getByText('Incomplete')).toBeTruthy();
  });

  it('no mezcla los pendientes de otro usuario', async () => {
    usePendingStore.setState({ pending: [{ ...pendiente('entry', '08:00'), userId: 99 }] });
    render(<WeeklySummary />);
    expect(await screen.findByText('No registrations this week')).toBeTruthy();
  });

  it('no muestra en otras semanas los pendientes de esta', async () => {
    usePendingStore.setState({ pending: [pendiente('entry', '08:00')] });
    render(<WeeklySummary />);
    await screen.findByText('Waiting to be sent');
    fireEvent.press(screen.getByLabelText('Previous week'));
    await waitFor(() => expect(screen.queryByText('Waiting to be sent')).toBeNull());
    expect(await screen.findByText('No registrations this week')).toBeTruthy();
  });

  it('combina lo del servidor con lo pendiente del mismo día', async () => {
    const fecha = moment().format('DD-MM-YYYY');
    resumen.mockResolvedValue({
      success: true,
      data: [{ id: 1, id_user: 7, date: `${fecha} 08:00:00`, type: 'entry', adminFlag: false, latCoordinate: '1', longCoordinate: '2' }],
    });
    usePendingStore.setState({ pending: [pendiente('exit', '17:00')] });
    render(<WeeklySummary />);
    expect((await screen.findAllByText('9h 00m')).length).toBeGreaterThan(0);
  });
});
