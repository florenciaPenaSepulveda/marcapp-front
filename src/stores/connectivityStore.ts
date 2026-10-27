import { create } from 'zustand';

type ConnectivityStoreT = {
  online: boolean;
  setOnline: (online: boolean) => void;
};

const useConnectivityStore = create<ConnectivityStoreT>()((set) => ({
  online: true,
  setOnline: (online) => set({ online }),
}));

export default useConnectivityStore;
