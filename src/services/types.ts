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
  latCoordinate: string | null;
  longCoordinate: string | null;
};

export const exito = <T>(data: T): Resultado<T> => ({ success: true, data });

export const fallo = (message: string): Resultado<never> => ({
  success: false,
  message,
});
