import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SIN_USUARIO = {
  id: 0,
  firstName: '',
  lastName: '',
  email: '',
  birthday: '',
  role: '',
};

type UserStoreT = {
  id: number;
  setId: (value: number) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  birthday: string;
  setBirthday: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  clearUser: () => void;
};

const useUserStore = create<UserStoreT>()(
  persist(
    (set) => ({
      ...SIN_USUARIO,
      setId: (value: number) => set({ id: value }),
      setFirstName: (value: string) => set({ firstName: value }),
      setLastName: (value: string) => set({ lastName: value }),
      setEmail: (value: string) => set({ email: value }),
      setBirthday: (value: string) => set({ birthday: value }),
      setRole: (value: string) => set({ role: value }),
      clearUser: () => set(SIN_USUARIO),
    }),
    {
      name: 'user-store-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useUserStore;
