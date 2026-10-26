import { usersApi } from './http';
import profileService from './profile.service';
import { mensajeDeError } from '../lib/errors';
import useTokenStore from '../stores/tokenStore';
import { exito, fallo, Resultado } from './types';

const loginService = async (payload: {
  email: string;
  password: string;
}): Promise<Resultado> => {
  try {
    const { data } = await usersApi.post<{ access_token: string }>(
      '/auth/login',
      { email: payload.email.trim(), pass: payload.password },
    );
    useTokenStore.getState().setToken(data.access_token);

    const perfil = await profileService();
    if (!perfil.success) {
      useTokenStore.getState().clearToken();
      return perfil;
    }
    return exito(undefined);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not sign in.'));
  }
};

export default loginService;
