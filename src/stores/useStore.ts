import { create } from 'zustand';

type BearState = {
  user: string;
  setUser: (value: string) => void;
};

const useStore = create<BearState>()((set) => ({
  user: '',
  setUser: (value: string) => set({ user: value }),
}));
export default useStore;
