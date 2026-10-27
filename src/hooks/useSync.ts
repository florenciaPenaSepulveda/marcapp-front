import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { hayConexion } from '../lib/connectivity';
import { syncPending } from '../services/sync.service';
import useConnectivityStore from '../stores/connectivityStore';
import usePendingStore from '../stores/pendingStore';
import useUserStore from '../stores/useStore';

export const INTERVALO_DE_REINTENTO_MS = 30000;

export const useSyncEngine = () => {
  const userId = useUserStore((state) => state.id);
  const hayPendientes = usePendingStore((state) =>
    state.pending.some((item) => item.userId === userId),
  );
  const setOnline = useConnectivityStore((state) => state.setOnline);

  useEffect(
    () =>
      NetInfo.addEventListener((estado) => {
        const conectado = hayConexion(estado);
        setOnline(conectado);
        if (conectado) {
          void syncPending();
        }
      }),
    [setOnline],
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.addEventListener) {
      return undefined;
    }
    const alCambiar = () => {
      const conectado = navigator.onLine;
      setOnline(conectado);
      if (conectado) {
        void syncPending();
      }
    };
    window.addEventListener('online', alCambiar);
    window.addEventListener('offline', alCambiar);
    return () => {
      window.removeEventListener('online', alCambiar);
      window.removeEventListener('offline', alCambiar);
    };
  }, [setOnline]);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        void syncPending();
      }
    });
    return () => suscripcion.remove();
  }, []);

  useEffect(() => {
    if (!hayPendientes) {
      return undefined;
    }
    const reintento = setInterval(() => void syncPending(), INTERVALO_DE_REINTENTO_MS);
    return () => clearInterval(reintento);
  }, [hayPendientes]);

  useEffect(() => {
    if (userId) {
      void syncPending();
    }
  }, [userId]);
};

export const useSyncStatus = () => {
  const userId = useUserStore((state) => state.id);
  const pending = usePendingStore((state) => state.pending);
  const rejected = usePendingStore((state) => state.rejected);
  const dismissRejected = usePendingStore((state) => state.dismissRejected);
  const online = useConnectivityStore((state) => state.online);
  const [syncing, setSyncing] = useState(false);

  const misPendientes = useMemo(
    () => pending.filter((item) => item.userId === userId),
    [pending, userId],
  );
  const misRechazados = useMemo(
    () => rejected.filter((item) => item.userId === userId),
    [rejected, userId],
  );

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      await syncPending();
    } finally {
      setSyncing(false);
    }
  }, []);

  const dismiss = useCallback(() => dismissRejected(userId), [dismissRejected, userId]);

  return { online, pending: misPendientes, rejected: misRechazados, syncing, syncNow, dismiss };
};
