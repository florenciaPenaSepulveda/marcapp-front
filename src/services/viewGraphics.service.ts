import { marcajeApi, usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Resultado, Usuario } from './types';

export type HorasMensuales = {
  id: number;
  idUser: number;
  month: string;
  average_hours_worked: number;
};

export type HorasDiarias = {
  id: number;
  idUser: number;
  day: string;
  dailyHoursWorked: number;
};

const viewGraphicsService = async (
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

const getMonthlyAverageHours = async (
  userId: number,
): Promise<Resultado<HorasMensuales[]>> => {
  try {
    const { data } = await marcajeApi.get<HorasMensuales[]>(
      '/statistics/monthly',
      { params: { userId } },
    );
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Error fetching monthly average hours.'));
  }
};

const getWeeklyAverageHours = async (
  userId: number,
): Promise<Resultado<HorasDiarias[]>> => {
  try {
    const { data } = await marcajeApi.get<HorasDiarias[]>('/statistics/daily', {
      params: { userId },
    });
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Error fetching daily hours.'));
  }
};

export default {
  viewGraphicsService,
  getMonthlyAverageHours,
  getWeeklyAverageHours,
};
