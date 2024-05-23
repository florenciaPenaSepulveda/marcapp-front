import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
};

const useUserStore = create<UserStoreT>()(
  persist(
    (set) => ({
      id: 0,
      setId: (value: number) => set({ id: value}),
      firstName: '',
      setFirstName: (value: string) => set({ firstName: value}),
      lastName: '',
      setLastName: (value: string) => set({ lastName: value}),
      email: '',
      setEmail: (value: string) => set({ email: value}),
      birthday: '',
      setBirthday: (value: string) => set({ birthday: value}),
    }),
    {
      name: "user-store-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);


export default useUserStore;