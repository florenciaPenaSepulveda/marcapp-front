import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import axios from 'axios';

const ESTADOS_REINTENTABLES = [429, 502, 503, 504];

export const hayConexion = (estado: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>): boolean =>
  estado.isConnected !== false && estado.isInternetReachable !== false;

export const estaConectado = async (): Promise<boolean> =>
  hayConexion(await NetInfo.fetch());

export const esErrorReintentable = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  return !error.response || ESTADOS_REINTENTABLES.includes(error.response.status);
};
