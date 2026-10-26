import axios, { AxiosInstance } from 'axios';
import { MARCAJE_URL, REQUEST_TIMEOUT_MS, USERS_URL } from '../config';
import useTokenStore from '../stores/tokenStore';
import { cerrarSesion, haySesion } from '../session';

export const crearCliente = (baseURL: string): AxiosInstance => {
  const cliente = axios.create({ baseURL, timeout: REQUEST_TIMEOUT_MS });

  cliente.interceptors.request.use((config) => {
    const { token } = useTokenStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  cliente.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401 && haySesion()) {
        cerrarSesion();
      }
      return Promise.reject(error);
    },
  );

  return cliente;
};

export const usersApi = crearCliente(USERS_URL);
export const marcajeApi = crearCliente(MARCAJE_URL);
