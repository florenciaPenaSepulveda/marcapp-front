import { marcajeApi, usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Marcaje, Resultado, Usuario } from './types';

const searchWorkerService = async (
  searchTerm: string,
): Promise<Resultado<Usuario[]>> => {
  try {
    const { data } = await usersApi.post<Usuario[]>('/users/all', {
      searchTerm: searchTerm.trim() || undefined,
    });
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Error in employee search.'));
  }
};

const addTimeRegistrationService = async (
  date: string,
  idUser: number,
): Promise<Resultado<Marcaje>> => {
  try {
    const { data } = await marcajeApi.post<
      { success: true; data: Marcaje } | { success: false; message: string }
    >('/marcaje/admin', { idUser, date });
    return data.success ? exito(data.data) : fallo(data.message);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not add the time registration.'));
  }
};

export { searchWorkerService, addTimeRegistrationService };
