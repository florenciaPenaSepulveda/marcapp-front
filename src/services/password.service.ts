import { usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import useTokenStore from '../stores/tokenStore';
import { exito, fallo, Resultado } from './types';

const changePasswordService = async (
  currentPassword: string,
  newPassword: string,
): Promise<Resultado> => {
  try {
    const { data } = await usersApi.patch<{ access_token: string }>(
      '/users/password',
      { currentPassword, newPassword },
    );
    useTokenStore.getState().setToken(data.access_token);
    return exito(undefined);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not change your password.'));
  }
};

export default changePasswordService;
