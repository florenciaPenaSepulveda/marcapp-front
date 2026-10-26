import moment from 'moment';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
const CLAVE = /^(?=.*\p{L})(?=.*\d).+$/u;

export const FORMATO_FECHA_NACIMIENTO = 'YYYY-MM-DD';
export const FORMATO_FECHA_HORA = 'DD-MM-YYYY HH:mm:ss';

export const validarEmail = (valor: string): string | null => {
  const email = valor.trim();
  if (!email) {
    return 'Email is required.';
  }
  return EMAIL.test(email) && email.length <= 254 ? null : 'Enter a valid email.';
};

export const validarNombre = (valor: string, etiqueta: string): string | null => {
  const nombre = valor.trim();
  if (nombre.length < 2 || nombre.length > 40) {
    return `${etiqueta} must have between 2 and 40 characters.`;
  }
  return NOMBRE.test(nombre) ? null : `${etiqueta} can only contain letters.`;
};

export const validarClave = (valor: string): string | null => {
  if (valor.length < 8 || valor.length > 72) {
    return 'Password must have between 8 and 72 characters.';
  }
  return CLAVE.test(valor) ? null : 'Password must include a letter and a number.';
};

export const validarFechaNacimiento = (valor: string): string | null => {
  const fecha = moment(valor, FORMATO_FECHA_NACIMIENTO, true);
  if (!fecha.isValid()) {
    return `Birthday must use the format ${FORMATO_FECHA_NACIMIENTO}.`;
  }
  if (fecha.isAfter(moment(), 'day') || fecha.year() < 1900) {
    return 'Birthday must be a valid past date.';
  }
  return null;
};

export const validarFechaHora = (valor: string): string | null =>
  moment(valor, FORMATO_FECHA_HORA, true).isValid()
    ? null
    : `Use the format ${FORMATO_FECHA_HORA}.`;

export const primerError = (...errores: (string | null)[]): string | null =>
  errores.find((error) => error !== null) ?? null;
