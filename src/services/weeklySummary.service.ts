import { marcajeApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Marcaje, Resultado } from './types';

const weeklySummaryService = async (
  startDate: string,
  endDate: string,
  idUser: number,
): Promise<Resultado<Marcaje[]>> => {
  try {
    const { data } = await marcajeApi.post<Marcaje[]>(
      `/marcaje/date/${idUser}`,
      { startDate, endDate },
    );
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not load the time registrations.'));
  }
};

export default weeklySummaryService;
