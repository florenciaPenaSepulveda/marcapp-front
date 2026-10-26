import useTokenStore from './stores/tokenStore';
import useUserStore from './stores/useStore';
import { reiniciarEnLogin } from './navigation';

export const cerrarSesion = (): void => {
  useTokenStore.getState().clearToken();
  useUserStore.getState().clearUser();
  reiniciarEnLogin();
};

export const haySesion = (): boolean => useTokenStore.getState().token !== '';
