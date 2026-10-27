import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TipoDeMarcaje = 'entry' | 'exit';

export type PendingRegistration = {
  clientId: string;
  userId: number;
  recordedAt: string;
  latCoordinate: string;
  longCoordinate: string;
  type: TipoDeMarcaje;
};

export type RejectedRegistration = {
  clientId: string;
  userId: number;
  recordedAt: string;
  type: TipoDeMarcaje;
  message: string;
};

export type EstadoConocido = {
  userId: number;
  day: string;
  state: 0 | 1 | 2;
};

type PendingStoreT = {
  pending: PendingRegistration[];
  rejected: RejectedRegistration[];
  knownState: EstadoConocido | null;
  enqueue: (item: PendingRegistration) => void;
  remove: (clientId: string) => void;
  reject: (item: PendingRegistration, message: string) => void;
  dismissRejected: (userId: number) => void;
  setKnownState: (estado: EstadoConocido) => void;
};

const usePendingStore = create<PendingStoreT>()(
  persist(
    (set) => ({
      pending: [],
      rejected: [],
      knownState: null,
      enqueue: (item) => set((state) => ({ pending: [...state.pending, item] })),
      remove: (clientId) =>
        set((state) => ({
          pending: state.pending.filter((item) => item.clientId !== clientId),
        })),
      reject: (item, message) =>
        set((state) => ({
          pending: state.pending.filter((p) => p.clientId !== item.clientId),
          rejected: [
            ...state.rejected,
            {
              clientId: item.clientId,
              userId: item.userId,
              recordedAt: item.recordedAt,
              type: item.type,
              message,
            },
          ],
        })),
      dismissRejected: (userId) =>
        set((state) => ({
          rejected: state.rejected.filter((item) => item.userId !== userId),
        })),
      setKnownState: (knownState) => set({ knownState }),
    }),
    {
      name: 'pending-registrations-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default usePendingStore;
