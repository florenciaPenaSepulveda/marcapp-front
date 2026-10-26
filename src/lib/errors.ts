import axios from 'axios';

type CuerpoDeError = { message?: string | string[] };

export const mensajeDeError = (error: unknown, porDefecto: string): string => {
  if (!axios.isAxiosError(error)) {
    return porDefecto;
  }
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? 'The server took too long to respond. Try again.'
      : 'Could not reach the server. Check your connection.';
  }
  const { status, data } = error.response;
  const mensaje = (data as CuerpoDeError | undefined)?.message;
  const texto = Array.isArray(mensaje) ? mensaje.join(', ') : mensaje;

  switch (status) {
    case 400:
    case 409:
      return texto || porDefecto;
    case 401:
      return 'Invalid credentials or expired session.';
    case 403:
      return 'You do not have permission to do this.';
    case 404:
      return texto || 'Not found.';
    case 429:
      return 'Too many attempts. Wait a minute and try again.';
    default:
      return status >= 500 ? 'Server error. Try again later.' : porDefecto;
  }
};
