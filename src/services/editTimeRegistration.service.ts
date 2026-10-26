import { marcajeApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Marcaje, Resultado } from './types';

const editTimeRegistrationService = async (
  id: number,
  date: string,
): Promise<Resultado<Marcaje>> => {
  try {
    const { data } = await marcajeApi.patch<
      { success: true; data: Marcaje } | { success: false; message: string }
    >(`/marcaje/admin/${id}`, { date });
    return data.success ? exito(data.data) : fallo(data.message);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not update the time registration.'));
  }
};

export default editTimeRegistrationService;
