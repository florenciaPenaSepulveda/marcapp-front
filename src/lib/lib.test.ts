import axios, { AxiosError } from 'axios';
import { colorDeAvatar, inicial } from './avatar';
import { mensajeDeError } from './errors';
import {
  primerError,
  validarClave,
  validarEmail,
  validarFechaHora,
  validarFechaNacimiento,
  validarNombre,
} from './validation';

const errorHttp = (status: number, data?: unknown) =>
  new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: {} } as never,
  });

describe('validación', () => {
  it.each([
    ['ana@test.cl', null],
    ['  ana@test.cl  ', null],
    ['', 'Email is required.'],
    ['sin-arroba', 'Enter a valid email.'],
    ['a@b', 'Enter a valid email.'],
    [`${'a'.repeat(250)}@test.cl`, 'Enter a valid email.'],
  ])('correo %p', (valor, esperado) => {
    expect(validarEmail(valor)).toBe(esperado);
  });

  it.each([
    ['Ana', null],
    ["D'Angelo", null],
    ['María José', null],
    ['Pérez-Núñez', null],
    ['A', 'Name must have between 2 and 40 characters.'],
    ['Ana123', 'Name can only contain letters.'],
    ['a'.repeat(41), 'Name must have between 2 and 40 characters.'],
  ])('nombre %p', (valor, esperado) => {
    expect(validarNombre(valor, 'Name')).toBe(esperado);
  });

  it.each([
    ['Clave12345', null],
    ['Clave#2024-ñandú', null],
    ['corta1', 'Password must have between 8 and 72 characters.'],
    ['soloLetrasLargas', 'Password must include a letter and a number.'],
    ['1234567890', 'Password must include a letter and a number.'],
    ['a1'.repeat(40), 'Password must have between 8 and 72 characters.'],
  ])('contraseña %p', (valor, esperado) => {
    expect(validarClave(valor)).toBe(esperado);
  });

  it.each([
    ['1995-04-20', null],
    ['2000-02-29', null],
    ['2999-01-01', 'Birthday must be a valid past date.'],
    ['1899-12-31', 'Birthday must be a valid past date.'],
    ['1995-02-30', 'Birthday must use the format YYYY-MM-DD.'],
    ['20/04/1995', 'Birthday must use the format YYYY-MM-DD.'],
    ['', 'Birthday must use the format YYYY-MM-DD.'],
  ])('fecha de nacimiento %p', (valor, esperado) => {
    expect(validarFechaNacimiento(valor)).toBe(esperado);
  });

  it.each([
    ['11-03-2024 09:00:00', null],
    ['11-03-2024', 'Use the format DD-MM-YYYY HH:mm:ss.'],
    ['11-03-2024 25:00:00', 'Use the format DD-MM-YYYY HH:mm:ss.'],
    ['2024-03-11 09:00:00', 'Use the format DD-MM-YYYY HH:mm:ss.'],
  ])('fecha y hora %p', (valor, esperado) => {
    expect(validarFechaHora(valor)).toBe(esperado);
  });

  it('primerError devuelve el primer mensaje no nulo', () => {
    expect(primerError(null, 'segundo', 'tercero')).toBe('segundo');
    expect(primerError(null, null)).toBeNull();
  });
});

describe('mensajeDeError', () => {
  const porDefecto = 'No se pudo';

  it('ignora errores que no son de red', () => {
    expect(mensajeDeError(new Error('x'), porDefecto)).toBe(porDefecto);
  });

  it('distingue la falta de conexión del tiempo de espera agotado', () => {
    expect(mensajeDeError(new AxiosError('x', 'ECONNABORTED'), porDefecto)).toMatch(/too long/);
    expect(mensajeDeError(new AxiosError('x', 'ERR_NETWORK'), porDefecto)).toMatch(/Could not reach/);
  });

  it('une los mensajes de validación del servidor', () => {
    expect(mensajeDeError(errorHttp(400, { message: ['a', 'b'] }), porDefecto)).toBe('a, b');
    expect(mensajeDeError(errorHttp(409, { message: 'Email already registered' }), porDefecto)).toBe(
      'Email already registered',
    );
    expect(mensajeDeError(errorHttp(400, {}), porDefecto)).toBe(porDefecto);
  });

  it.each([
    [401, /Invalid credentials/],
    [403, /permission/],
    [404, /Not found/],
    [429, /Too many attempts/],
    [500, /Server error/],
    [503, /Server error/],
  ])('traduce el estado %i', (estado, patron) => {
    expect(mensajeDeError(errorHttp(estado), porDefecto)).toMatch(patron);
  });

  it('usa el mensaje por defecto en otros estados', () => {
    expect(mensajeDeError(errorHttp(418), porDefecto)).toBe(porDefecto);
    expect(axios.isAxiosError(errorHttp(418))).toBe(true);
  });
});

describe('avatar', () => {
  it('el color es estable para el mismo nombre', () => {
    expect(colorDeAvatar('Ana')).toBe(colorDeAvatar('Ana'));
    expect(colorDeAvatar('Ana')).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('la inicial va en mayúscula y tolera espacios o vacío', () => {
    expect(inicial('ana')).toBe('A');
    expect(inicial('  luz')).toBe('L');
    expect(inicial('')).toBe('');
  });
});
