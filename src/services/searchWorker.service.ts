import { marcajeApi, usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import {
  EstadisticasDeUsuarios,
  EstadoDeHoy,
  exito,
  fallo,
  Marcaje,
  Pagina,
  Resultado,
  Resumen,
  Usuario,
} from './types';

export const TAMANO_DE_PAGINA = 20;

const searchWorkerService = async (
  searchTerm: string,
  offset = 0,
  limit = TAMANO_DE_PAGINA,
): Promise<Resultado<Pagina<Usuario>>> => {
  try {
    const { data } = await usersApi.get<Pagina<Usuario>>('/users', {
      params: { search: searchTerm.trim() || undefined, limit, offset },
    });
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not load the workers.'));
  }
};

const teamStatusService = async (): Promise<Resultado<EstadoDeHoy[]>> => {
  try {
    const { data } = await marcajeApi.get<EstadoDeHoy[]>('/marcaje/admin/today');
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, "Could not load today's status."));
  }
};

const userStatsService = async (): Promise<Resultado<EstadisticasDeUsuarios>> => {
  try {
    const { data } = await usersApi.get<EstadisticasDeUsuarios>('/users/stats');
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not load the worker totals.'));
  }
};

const summaryService = async (
  userId?: number,
  from?: string,
  to?: string,
): Promise<Resultado<Resumen>> => {
  try {
    const { data } = await marcajeApi.get<Resumen>('/statistics/summary', {
      params: { userId, from, to },
    });
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not load the hours summary.'));
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

const deleteTimeRegistrationService = async (id: number): Promise<Resultado> => {
  try {
    await marcajeApi.delete(`/marcaje/admin/${id}`);
    return exito(undefined);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not delete the time registration.'));
  }
};

const deleteWorkerService = async (
  id: number,
): Promise<Resultado<{ registrationsRemoved: boolean }>> => {
  try {
    await usersApi.delete(`/users/${id}`);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not delete the worker.'));
  }
  try {
    await marcajeApi.delete(`/marcaje/admin/user/${id}`);
    return exito({ registrationsRemoved: true });
  } catch {
    return exito({ registrationsRemoved: false });
  }
};

export {
  deleteWorkerService,
  searchWorkerService,
  teamStatusService,
  userStatsService,
  summaryService,
  addTimeRegistrationService,
  deleteTimeRegistrationService,
};
