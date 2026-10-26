import moment from 'moment';
import { Marcaje } from '../services/types';

const FORMATO = 'DD-MM-YYYY HH:mm:ss';

export type Jornada = {
  dia: string;
  entrada: Marcaje | null;
  salida: Marcaje | null;
  horas: number | null;
};

export const hora = (marca: Marcaje | null): string =>
  marca ? moment(marca.date, FORMATO).format('HH:mm') : '--:--';

export const agruparPorDia = (marcajes: Marcaje[]): Jornada[] => {
  const dias = new Map<string, Jornada>();
  [...marcajes]
    .sort((a, b) => moment(a.date, FORMATO).valueOf() - moment(b.date, FORMATO).valueOf())
    .forEach((marca) => {
      const dia = marca.date.split(' ')[0];
      const jornada = dias.get(dia) ?? { dia, entrada: null, salida: null, horas: null };
      if (marca.type === 'entry') {
        jornada.entrada = marca;
      } else {
        jornada.salida = marca;
      }
      dias.set(dia, jornada);
    });
  return [...dias.values()]
    .map((jornada) => ({
      ...jornada,
      horas:
        jornada.entrada && jornada.salida
          ? moment(jornada.salida.date, FORMATO).diff(moment(jornada.entrada.date, FORMATO), 'minutes') / 60
          : null,
    }))
    .sort((a, b) => moment(b.dia, 'DD-MM-YYYY').valueOf() - moment(a.dia, 'DD-MM-YYYY').valueOf());
};

export const formatearHoras = (horas: number): string => {
  const minutos = Math.round(horas * 60);
  return `${Math.floor(minutos / 60)}h ${String(minutos % 60).padStart(2, '0')}m`;
};

export const totalDeHoras = (jornadas: Jornada[]): number =>
  jornadas.reduce((suma, jornada) => suma + (jornada.horas ?? 0), 0);

export const diasSinSalida = (jornadas: Jornada[]): string[] =>
  jornadas.filter((jornada) => jornada.entrada && !jornada.salida).map((jornada) => jornada.dia);
