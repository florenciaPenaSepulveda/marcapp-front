import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SyncBanner } from './SyncBanner';
import { syncPending } from '../services/sync.service';
import usePendingStore, { PendingRegistration } from '../stores/pendingStore';
import useConnectivityStore from '../stores/connectivityStore';
import useUserStore from '../stores/useStore';

jest.mock('../services/sync.service');

const item = (clientId: string): PendingRegistration => ({
  clientId,
  userId: 7,
  recordedAt: '2026-10-26T12:00:00.000Z',
  latCoordinate: '1',
  longCoordinate: '2',
  type: 'entry',
});

beforeEach(() => {
  jest.clearAllMocks();
  (syncPending as jest.Mock).mockResolvedValue({ sent: 1, rejected: 0, remaining: 0 });
  usePendingStore.setState({ pending: [], rejected: [], knownState: null });
  useConnectivityStore.setState({ online: true });
  useUserStore.getState().clearUser();
  useUserStore.getState().setId(7);
});

describe('SyncBanner', () => {
  it('no muestra nada cuando hay conexión y todo está enviado', () => {
    const { toJSON } = render(<SyncBanner />);
    expect(toJSON()).toBeNull();
  });

  it('sin conexión explica que se puede seguir trabajando', () => {
    useConnectivityStore.setState({ online: false });
    render(<SyncBanner />);
    expect(screen.getByText(/You are offline/)).toBeTruthy();
    expect(screen.queryByText('Send now')).toBeNull();
  });

  it('cuenta los registros pendientes en singular y plural', () => {
    usePendingStore.setState({ pending: [item('a')] });
    const { rerender } = render(<SyncBanner />);
    expect(screen.getByText('1 registration is waiting to be sent.')).toBeTruthy();
    usePendingStore.setState({ pending: [item('a'), item('b')] });
    rerender(<SyncBanner />);
    expect(screen.getByText('2 registrations are waiting to be sent.')).toBeTruthy();
  });

  it('con conexión permite enviar de inmediato', async () => {
    usePendingStore.setState({ pending: [item('a')] });
    render(<SyncBanner />);
    fireEvent.press(screen.getByText('Send now'));
    await waitFor(() => expect(syncPending).toHaveBeenCalled());
  });

  it('muestra lo que el servidor no aceptó y permite descartarlo', () => {
    usePendingStore.setState({
      rejected: [
        {
          clientId: 'r1',
          userId: 7,
          recordedAt: '2026-10-26T12:30:00.000Z',
          type: 'exit',
          message: 'Entry and exit already registered for today',
        },
      ],
    });
    render(<SyncBanner />);
    expect(screen.getByText(/check-out of .* was not accepted: Entry and exit already registered for today/)).toBeTruthy();
    fireEvent.press(screen.getByText('Dismiss'));
    expect(usePendingStore.getState().rejected).toEqual([]);
  });

  it('describe una entrada rechazada como check-in', () => {
    usePendingStore.setState({
      rejected: [{ clientId: 'r1', userId: 7, recordedAt: '2026-10-26T12:30:00.000Z', type: 'entry', message: 'x' }],
    });
    render(<SyncBanner />);
    expect(screen.getByText(/Your check-in of/)).toBeTruthy();
  });
});
