export type Resultado<T = undefined> =
  | { success: true; data: T }
  | { success: false; message: string };

export type Usuario = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  type?: string;
  role?: string;
};

export type Marcaje = {
  id: number;
  id_user: number;
  date: string;
  type: 'entry' | 'exit';
  adminFlag: boolean;
  offline?: boolean;
  latCoordinate: string | null;
  longCoordinate: string | null;
};

export const exito = <T>(data: T): Resultado<T> => ({ success: true, data });

export const fallo = (message: string): Resultado<never> => ({
  success: false,
  message,
});

export type Pagina<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type EstadoDeHoy = {
  idUser: number;
  state: 'working' | 'done';
  checkIn: string | null;
  checkOut: string | null;
};

export type ResumenDeHoras = {
  idUser: number;
  daysWorked: number;
  totalHours: number;
  averageHoursPerDay: number;
  incompleteDays: number;
};

export type Resumen = {
  from: string;
  to: string;
  daysWorked: number;
  totalHours: number;
  averageHoursPerDay: number;
  incompleteDays: number;
  perUser: ResumenDeHoras[];
};

export type EstadisticasDeUsuarios = {
  total: number;
  admins: number;
  workers: number;
  newThisMonth: number;
};
