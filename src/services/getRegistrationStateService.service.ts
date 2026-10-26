import { marcajeApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Resultado } from './types';

export type EstadoDelDia = 0 | 1 | 2;

const getRegistrationStateService = async (
  idUser: number,
): Promise<Resultado<EstadoDelDia>> => {
  try {
    const { data } = await marcajeApi.post<EstadoDelDia>(
      `/marcaje/user/today/${idUser}`,
      {},
    );
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not load today\'s status.'));
  }
};

export default getRegistrationStateService;
