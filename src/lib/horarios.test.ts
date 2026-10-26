import { agruparPorDia, diasSinSalida, formatearHoras, hora, totalDeHoras } from './horarios';
import { Marcaje } from '../services/types';

let id = 0;
const marca = (date: string, type: 'entry' | 'exit'): Marcaje => ({
  id: ++id,
  id_user: 7,
  date,
  type,
  adminFlag: false,
  latCoordinate: null,
  longCoordinate: null,
});

describe('agruparPorDia', () => {
  it('une entrada y salida de cada día y calcula las horas', () => {
    const jornadas = agruparPorDia([
      marca('11-03-2024 17:30:00', 'exit'),
      marca('11-03-2024 09:00:00', 'entry'),
      marca('12-03-2024 08:00:00', 'entry'),
      marca('12-03-2024 12:00:00', 'exit'),
    ]);
    expect(jornadas.map((j) => [j.dia, j.horas])).toEqual([
      ['12-03-2024', 4],
      ['11-03-2024', 8.5],
    ]);
  });

  it('deja las horas en nulo cuando falta la salida y lo informa como pendiente', () => {
    const jornadas = agruparPorDia([marca('11-03-2024 09:00:00', 'entry')]);
    expect(jornadas[0].horas).toBeNull();
    expect(diasSinSalida(jornadas)).toEqual(['11-03-2024']);
  });

  it('ordena de la fecha más reciente a la más antigua', () => {
    const jornadas = agruparPorDia([
      marca('09-03-2024 09:00:00', 'entry'),
      marca('11-03-2024 09:00:00', 'entry'),
      marca('10-03-2024 09:00:00', 'entry'),
    ]);
    expect(jornadas.map((j) => j.dia)).toEqual(['11-03-2024', '10-03-2024', '09-03-2024']);
  });

  it('devuelve una lista vacía sin marcajes', () => {
    expect(agruparPorDia([])).toEqual([]);
  });
});

describe('formato y totales', () => {
  it('formatea horas con minutos', () => {
    expect(formatearHoras(8.5)).toBe('8h 30m');
    expect(formatearHoras(0)).toBe('0h 00m');
    expect(formatearHoras(1.0833)).toBe('1h 05m');
  });

  it('suma solo las jornadas completas', () => {
    const jornadas = agruparPorDia([
      marca('11-03-2024 09:00:00', 'entry'),
      marca('11-03-2024 17:00:00', 'exit'),
      marca('12-03-2024 09:00:00', 'entry'),
    ]);
    expect(totalDeHoras(jornadas)).toBe(8);
  });

  it('muestra la hora o un guion cuando no hay marca', () => {
    expect(hora(marca('11-03-2024 09:05:00', 'entry'))).toBe('09:05');
    expect(hora(null)).toBe('--:--');
  });
});
