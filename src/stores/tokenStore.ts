import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenStoreT = {
  token: string
  setToken: (value: string) => void;
};

const useTokenStore = create<TokenStoreT>()(
  persist(
    (set) => ({
      token: '',
      setToken: (value: string) => set({ token: value}),
    }),
    {
      name: "token-store-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);


export default useTokenStore;