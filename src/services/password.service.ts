import { usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Resultado } from './types';

const changePasswordService = async (
  currentPassword: string,
  newPassword: string,
): Promise<Resultado> => {
  try {
    await usersApi.patch('/users/password', { currentPassword, newPassword });
    return exito(undefined);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not change your password.'));
  }
};

export default changePasswordService;
