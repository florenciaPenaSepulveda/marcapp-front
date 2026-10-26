import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './secureStorage';

type TokenStoreT = {
  token: string;
  hydrated: boolean;
  setToken: (value: string) => void;
  clearToken: () => void;
};

const useTokenStore = create<TokenStoreT>()(
  persist(
    (set) => ({
      token: '',
      hydrated: false,
      setToken: (value: string) => set({ token: value }),
      clearToken: () => set({ token: '' }),
    }),
    {
      name: 'token-store-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
);

const marcarHidratado = () => useTokenStore.setState({ hydrated: true });

if (useTokenStore.persist.hasHydrated()) {
  marcarHidratado();
} else {
  useTokenStore.persist.onFinishHydration(marcarHidratado);
}

export default useTokenStore;
