import { marcajeApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { diaLocal } from '../lib/estadoLocal';
import { esErrorReintentable } from '../lib/connectivity';
import usePendingStore, { PendingRegistration } from '../stores/pendingStore';
import useUserStore from '../stores/useStore';
import { Marcaje } from './types';

type RespuestaMarcaje =
  | { success: true; data: Marcaje }
  | { success: false; message: string };

export type ResumenDeSincronizacion = {
  sent: number;
  rejected: number;
  remaining: number;
};

let sincronizando = false;

const pendientesDe = (userId: number): PendingRegistration[] =>
  usePendingStore.getState().pending.filter((item) => item.userId === userId);

export const syncPending = async (): Promise<ResumenDeSincronizacion> => {
  const userId = useUserStore.getState().id;
  const resumen: ResumenDeSincronizacion = {
    sent: 0,
    rejected: 0,
    remaining: userId ? pendientesDe(userId).length : 0,
  };
  if (!userId || sincronizando) {
    return resumen;
  }

  sincronizando = true;
  try {
    for (const item of pendientesDe(userId)) {
      try {
        const { data } = await marcajeApi.post<RespuestaMarcaje>('/marcaje', {
          latCoordinate: item.latCoordinate,
          longCoordinate: item.longCoordinate,
          recordedAt: item.recordedAt,
          clientId: item.clientId,
        });
        if (data.success) {
          usePendingStore.getState().remove(item.clientId);
          resumen.sent += 1;
          if (diaLocal(item.recordedAt) === diaLocal()) {
            usePendingStore.getState().setKnownState({
              userId,
              day: diaLocal(),
              state: item.type === 'entry' ? 1 : 2,
            });
          }
        } else {
          usePendingStore.getState().reject(item, data.message);
          resumen.rejected += 1;
        }
      } catch (error) {
        if (esErrorReintentable(error) || isUnauthorized(error)) {
          break;
        }
        usePendingStore
          .getState()
          .reject(item, mensajeDeError(error, 'The server rejected this registration.'));
        resumen.rejected += 1;
      }
    }
  } finally {
    sincronizando = false;
  }
  resumen.remaining = pendientesDe(userId).length;
  return resumen;
};

const isUnauthorized = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { response?: { status?: number } }).response?.status === 401;
