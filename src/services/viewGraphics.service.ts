import { marcajeApi } from './http';
import { searchWorkerService } from './searchWorker.service';
import { mensajeDeError } from '../lib/errors';
import { exito, fallo, Resultado } from './types';

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
  viewGraphicsService: searchWorkerService,
  getMonthlyAverageHours,
  getWeeklyAverageHours,
};
