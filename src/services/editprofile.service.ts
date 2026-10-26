import { usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Resultado, Usuario } from './types';

export type EditProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
};

const editService = async (data: EditProfileData): Promise<Resultado<Usuario>> => {
  try {
    const respuesta = await usersApi.patch<Usuario>('/users', {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      birthday: data.birthday.trim(),
    });
    return exito(respuesta.data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not update your profile.'));
  }
};

export default editService;
