import { usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Resultado } from './types';

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  pass: string;
  birthday: string;
};

const registerService = async (data: RegisterData): Promise<Resultado> => {
  try {
    await usersApi.post('/users/register', {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      pass: data.pass,
      birthday: data.birthday.trim(),
    });
    return exito(undefined);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not create your account.'));
  }
};

export default registerService;
