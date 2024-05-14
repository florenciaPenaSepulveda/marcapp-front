import { create } from 'zustand';

type BearState = {
  email: string;
  setEmail: (value: string) => void;
  token: string | null;
  setToken: (value: string | null) => void;
};

const useStore = create<BearState>()((set) => ({
  email: '',
  setEmail: (value: string) => set({ email: value }),
  token: null,
  setToken: (value: string | null) => set({ token: value }),
}));
export default useStore;
