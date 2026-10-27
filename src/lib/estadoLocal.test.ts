import { diaLocal, estadoLocal, pendientesComoMarcajes, siguienteTipo } from './estadoLocal';
import { PendingRegistration } from '../stores/pendingStore';

const pendiente = (type: 'entry' | 'exit', extra: Partial<PendingRegistration> = {}): PendingRegistration => ({
  clientId: `id-${type}`,
  userId: 7,
  recordedAt: new Date().toISOString(),
  latCoordinate: '-33.44',
  longCoordinate: '-70.66',
  type,
  ...extra,
});

describe('estadoLocal', () => {
  const hoy = diaLocal();

  it('sin información el día está sin iniciar', () => {
    expect(estadoLocal(7, null, [])).toBe(0);
  });

  it('usa el último estado conocido del servidor solo si es de hoy y del mismo usuario', () => {
    expect(estadoLocal(7, { userId: 7, day: hoy, state: 1 }, [])).toBe(1);
    expect(estadoLocal(7, { userId: 8, day: hoy, state: 1 }, [])).toBe(0);
    expect(estadoLocal(7, { userId: 7, day: '2020-01-01', state: 2 }, [])).toBe(0);
  });

  it('una entrada pendiente pasa el día a "con entrada"', () => {
    expect(estadoLocal(7, null, [pendiente('entry')])).toBe(1);
  });

  it('una salida pendiente completa el día', () => {
    expect(estadoLocal(7, null, [pendiente('entry'), pendiente('exit')])).toBe(2);
    expect(estadoLocal(7, { userId: 7, day: hoy, state: 1 }, [pendiente('exit')])).toBe(2);
  });

  it('un día ya completo en el servidor no retrocede por una entrada pendiente', () => {
    expect(estadoLocal(7, { userId: 7, day: hoy, state: 2 }, [pendiente('entry')])).toBe(2);
  });

  it('ignora los pendientes de otros usuarios y de otros días', () => {
    expect(estadoLocal(7, null, [pendiente('entry', { userId: 9 })])).toBe(0);
    expect(estadoLocal(7, null, [pendiente('entry', { recordedAt: '2020-01-01T12:00:00.000Z' })])).toBe(0);
  });
});

describe('siguienteTipo', () => {
  it('determina qué marcaje corresponde', () => {
    expect(siguienteTipo(0)).toBe('entry');
    expect(siguienteTipo(1)).toBe('exit');
    expect(siguienteTipo(2)).toBeNull();
  });
});

describe('pendientesComoMarcajes', () => {
  it('convierte los pendientes del usuario al formato del servidor, marcados como sin conexión', () => {
    const lista = pendientesComoMarcajes(
      [
        pendiente('entry', { recordedAt: '2026-10-26T15:30:00.000Z' }),
        pendiente('exit', { userId: 99 }),
      ],
      7,
    );
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({
      id: -1,
      id_user: 7,
      type: 'entry',
      offline: true,
      adminFlag: false,
      latCoordinate: '-33.44',
    });
    expect(lista[0].date).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/);
  });

  it('asigna identificadores negativos distintos', () => {
    const ids = pendientesComoMarcajes([pendiente('entry'), pendiente('exit')], 7).map((m) => m.id);
    expect(ids).toEqual([-1, -2]);
  });
});
