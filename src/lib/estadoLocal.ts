import moment from 'moment';
import {
  EstadoConocido,
  PendingRegistration,
  TipoDeMarcaje,
} from '../stores/pendingStore';
import { Marcaje } from '../services/types';
import { EstadoDelDia } from '../services/getRegistrationStateService.service';

const FORMATO_DIA = 'YYYY-MM-DD';
const FORMATO_SERVIDOR = 'DD-MM-YYYY HH:mm:ss';

export const diaLocal = (fecha: Date | string = new Date()): string =>
  moment(fecha).format(FORMATO_DIA);

export const estadoLocal = (
  userId: number,
  conocido: EstadoConocido | null,
  pendientes: PendingRegistration[],
  hoy: string = diaLocal(),
): EstadoDelDia => {
  const base: EstadoDelDia =
    conocido && conocido.userId === userId && conocido.day === hoy
      ? conocido.state
      : 0;
  const deHoy = pendientes.filter(
    (p) => p.userId === userId && diaLocal(p.recordedAt) === hoy,
  );
  if (deHoy.some((p) => p.type === 'exit')) {
    return 2;
  }
  if (deHoy.some((p) => p.type === 'entry')) {
    return base === 2 ? 2 : 1;
  }
  return base;
};

export const siguienteTipo = (estado: EstadoDelDia): TipoDeMarcaje | null =>
  estado === 0 ? 'entry' : estado === 1 ? 'exit' : null;

export const pendientesComoMarcajes = (
  pendientes: PendingRegistration[],
  userId: number,
): Marcaje[] =>
  pendientes
    .filter((p) => p.userId === userId)
    .map((p, indice) => ({
      id: -(indice + 1),
      id_user: p.userId,
      date: moment(p.recordedAt).format(FORMATO_SERVIDOR),
      type: p.type,
      adminFlag: false,
      offline: true,
      latCoordinate: p.latCoordinate,
      longCoordinate: p.longCoordinate,
    }));
