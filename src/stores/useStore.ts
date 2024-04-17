import { create } from 'zustand';

type BearState = {
  email: string;
  setEmail: (value: string) => void;
};

const useStore = create<BearState>()((set) => ({
  email: '',
  setEmail: (value: string) => set({ email: value }),
}));
export default useStore;
