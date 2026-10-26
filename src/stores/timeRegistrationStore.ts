import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TimeRegistrationStoreT = {
  id: number;
  setId: (value: number) => void;
  id_user: number;
  setIdUser: (value: number) => void;
  date: string;
  setDate: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  adminFlag: boolean;
  setAdminFlag: (value: boolean) => void;
  latCoordinate: string;
  setLatCoordinate: (value: string) => void;
  longCoordinate: string;
  setLongCoordinate: (value: string) => void;
};

const TimeRegistrationStore = create<TimeRegistrationStoreT>()(
  persist(
    (set) => ({
      id: 0,
      setId: (value: number) => set({ id: value}),
      id_user: 0,
      setIdUser: (value: number) => set({ id_user: value}),
      date: '',
      setDate: (value: string) => set({ date: value}),
      type: '',
      setType: (value: string) => set({ type: value}),
      adminFlag: false,
      setAdminFlag: (value: boolean) => set({ adminFlag: value}),
      latCoordinate: '',
      setLatCoordinate: (value: string) => set({ latCoordinate: value}),
      longCoordinate: '',
      setLongCoordinate: (value: string) => set({ longCoordinate: value}),
    }),
    {
      name: "time-registration-store-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export default TimeRegistrationStore;