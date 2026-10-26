import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as Location from 'expo-location';
import { marcajeApi, usersApi } from './http';
import loginService from './login.service';
import profileService from './profile.service';
import registerService from './register.service';
import editService from './editprofile.service';
import timeRegistrationService from './timeRegistration.service';
import getRegistrationStateService from './getRegistrationStateService.service';
import weeklySummaryService from './weeklySummary.service';
import { addTimeRegistrationService, searchWorkerService } from './searchWorker.service';
import editTimeRegistrationService from './editTimeRegistration.service';
import viewGraphicsService from './viewGraphics.service';
import healthcheckService from './healthcheck.service';
import useTokenStore from '../stores/tokenStore';
import useUserStore from '../stores/useStore';
import { cerrarSesion } from '../session';

jest.mock('../session', () => ({
  cerrarSesion: jest.fn(),
  haySesion: () => require('../stores/tokenStore').default.getState().token !== '',
}));

const usuarios = new MockAdapter(usersApi);
const marcajes = new MockAdapter(marcajeApi);

const perfil = {
  id: 7,
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@test.cl',
  birthday: '1995-04-20',
  role: 'user',
};

beforeEach(() => {
  usuarios.reset();
  marcajes.reset();
  useTokenStore.setState({ token: '' });
  useUserStore.getState().clearUser();
  jest.clearAllMocks();
});

describe('cliente HTTP', () => {
  it('agrega el token del store en la cabecera Authorization', async () => {
    useTokenStore.setState({ token: 'abc' });
    usuarios.onGet('/x').reply((config) => [200, { auth: config.headers?.Authorization }]);
    const { data } = await usersApi.get('/x');
    expect(data.auth).toBe('Bearer abc');
  });

  it('no envía cabecera cuando no hay sesión', async () => {
    usuarios.onGet('/x').reply((config) => [200, { auth: config.headers?.Authorization ?? null }]);
    expect((await usersApi.get('/x')).data.auth).toBeNull();
  });

  it('cierra la sesión cuando el servidor responde 401 con una sesión activa', async () => {
    useTokenStore.setState({ token: 'vencido' });
    marcajes.onGet('/x').reply(401);
    await expect(marcajeApi.get('/x')).rejects.toBeTruthy();
    expect(cerrarSesion).toHaveBeenCalledTimes(1);
  });

  it('un 401 sin sesión (credenciales inválidas) no dispara el cierre', async () => {
    usuarios.onGet('/x').reply(401);
    await expect(usersApi.get('/x')).rejects.toBeTruthy();
    expect(cerrarSesion).not.toHaveBeenCalled();
  });

  it('otros errores no cierran la sesión', async () => {
    useTokenStore.setState({ token: 'bueno' });
    usuarios.onGet('/x').reply(500);
    await expect(usersApi.get('/x')).rejects.toBeTruthy();
    expect(cerrarSesion).not.toHaveBeenCalled();
  });
});

describe('login y perfil', () => {
  it('guarda el token y carga el perfil al ingresar', async () => {
    usuarios.onPost('/auth/login').reply(200, { access_token: 'tok' });
    usuarios.onPost('/auth/profile').reply(200, perfil);
    const res = await loginService({ email: ' ana@test.cl ', password: 'Clave12345' });
    expect(res.success).toBe(true);
    expect(useTokenStore.getState().token).toBe('tok');
    expect(useUserStore.getState()).toMatchObject({ id: 7, firstName: 'Ana', role: 'user' });
    expect(JSON.parse(usuarios.history.post[0].data)).toEqual({ email: 'ana@test.cl', pass: 'Clave12345' });
  });

  it('informa credenciales inválidas sin guardar nada', async () => {
    usuarios.onPost('/auth/login').reply(401, { message: 'Invalid credentials' });
    const res = await loginService({ email: 'ana@test.cl', password: 'mala' });
    expect(res).toEqual({ success: false, message: 'Invalid credentials or expired session.' });
    expect(useTokenStore.getState().token).toBe('');
  });

  it('descarta el token si el perfil no se puede cargar', async () => {
    usuarios.onPost('/auth/login').reply(200, { access_token: 'tok' });
    usuarios.onPost('/auth/profile').reply(500);
    const res = await loginService({ email: 'ana@test.cl', password: 'Clave12345' });
    expect(res.success).toBe(false);
    expect(useTokenStore.getState().token).toBe('');
  });

  it('el perfil informa los errores de red', async () => {
    usuarios.onPost('/auth/profile').networkError();
    const res = await profileService();
    expect(res).toMatchObject({ success: false, message: expect.stringMatching(/Could not reach/) });
  });
});

describe('registro y edición de perfil', () => {
  const datos = { firstName: ' Ana ', lastName: 'Pérez', email: ' ana@test.cl ', pass: 'Clave12345', birthday: '1995-04-20' };

  it('envía los datos recortados y no incluye campos extra', async () => {
    usuarios.onPost('/users/register').reply(201, {});
    expect((await registerService(datos)).success).toBe(true);
    expect(JSON.parse(usuarios.history.post[0].data)).toEqual({ ...datos, firstName: 'Ana', email: 'ana@test.cl' });
  });

  it('muestra el conflicto de correo repetido', async () => {
    usuarios.onPost('/users/register').reply(409, { message: 'Email already registered' });
    expect(await registerService(datos)).toEqual({ success: false, message: 'Email already registered' });
  });

  it('edita el perfil y devuelve el usuario actualizado', async () => {
    usuarios.onPatch('/users').reply(200, perfil);
    const res = await editService({ firstName: 'Ana', lastName: 'Pérez', email: 'ana@test.cl', birthday: '1995-04-20' });
    expect(res).toEqual({ success: true, data: perfil });
  });

  it('informa la validación del servidor al editar', async () => {
    usuarios.onPatch('/users').reply(400, { message: ['Birthday must be a valid past date'] });
    const res = await editService({ firstName: 'Ana', lastName: 'Pérez', email: 'ana@test.cl', birthday: '2999-01-01' });
    expect(res).toEqual({ success: false, message: 'Birthday must be a valid past date' });
  });
});

describe('marcajes', () => {
  const marca = { id: 1, id_user: 7, date: '11-03-2024 09:00:00', type: 'entry', adminFlag: false, latCoordinate: '-33', longCoordinate: '-70' };

  it('registra la hora con la ubicación y sin token en el cuerpo', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: -33.44, longitude: -70.66 } });
    marcajes.onPost('/marcaje').reply(201, { success: true, data: marca });
    const res = await timeRegistrationService();
    expect(res).toEqual({ success: true, data: marca });
    expect(JSON.parse(marcajes.history.post[0].data)).toEqual({ latCoordinate: '-33.44', longCoordinate: '-70.66' });
  });

  it('exige el permiso de ubicación', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const res = await timeRegistrationService();
    expect(res).toMatchObject({ success: false, message: expect.stringMatching(/Location permission/) });
    expect(marcajes.history.post).toHaveLength(0);
  });

  it('tolera errores al obtener la ubicación', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(new Error('sin GPS'));
    expect((await timeRegistrationService()).success).toBe(false);
  });

  it('muestra el mensaje de negocio del servidor', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 1, longitude: 2 } });
    marcajes.onPost('/marcaje').reply(201, { success: false, message: 'Please wait a few seconds before registering again' });
    expect(await timeRegistrationService()).toEqual({
      success: false,
      message: 'Please wait a few seconds before registering again',
    });
  });

  it('consulta el estado del día', async () => {
    marcajes.onPost('/marcaje/user/today/7').reply(201, 1);
    expect(await getRegistrationStateService(7)).toEqual({ success: true, data: 1 });
    marcajes.onPost('/marcaje/user/today/7').reply(403);
    expect((await getRegistrationStateService(7)).success).toBe(false);
  });

  it('consulta un período', async () => {
    marcajes.onPost('/marcaje/date/7').reply(201, [marca]);
    expect(await weeklySummaryService('11-03-2024', '17-03-2024', 7)).toEqual({ success: true, data: [marca] });
    expect(JSON.parse(marcajes.history.post[0].data)).toEqual({ startDate: '11-03-2024', endDate: '17-03-2024' });
    marcajes.onPost('/marcaje/date/7').reply(400, { message: 'Dates must use the format DD-MM-YYYY' });
    expect((await weeklySummaryService('x', 'y', 7)).success).toBe(false);
  });

  it('el administrador agrega y edita marcajes', async () => {
    marcajes.onPost('/marcaje/admin').reply(201, { success: true, data: marca });
    expect(await addTimeRegistrationService('11-03-2024 09:00:00', 7)).toEqual({ success: true, data: marca });
    expect(JSON.parse(marcajes.history.post[0].data)).toEqual({ idUser: 7, date: '11-03-2024 09:00:00' });
    marcajes.onPost('/marcaje/admin').reply(201, { success: false, message: 'The date cannot be in the future' });
    expect(await addTimeRegistrationService('01-01-2099 09:00:00', 7)).toEqual({
      success: false,
      message: 'The date cannot be in the future',
    });

    marcajes.onPatch('/marcaje/admin/1').reply(200, { success: true, data: marca });
    expect((await editTimeRegistrationService(1, '11-03-2024 08:45:00')).success).toBe(true);
    expect(JSON.parse(marcajes.history.patch[0].data)).toEqual({ date: '11-03-2024 08:45:00' });
    marcajes.onPatch('/marcaje/admin/1').reply(403);
    expect((await editTimeRegistrationService(1, 'x')).success).toBe(false);
  });
});

describe('administración de usuarios y estadísticas', () => {
  it('busca usuarios y omite el término vacío', async () => {
    usuarios.onPost('/users/all').reply(201, [perfil]);
    expect(await searchWorkerService('  ')).toEqual({ success: true, data: [perfil] });
    expect(JSON.parse(usuarios.history.post[0].data ?? '{}')).toEqual({});
    await searchWorkerService(' ana ');
    expect(JSON.parse(usuarios.history.post[1].data)).toEqual({ searchTerm: 'ana' });
    usuarios.onPost('/users/all').reply(403);
    expect((await searchWorkerService('x')).success).toBe(false);
  });

  it('pide las estadísticas filtradas por usuario', async () => {
    marcajes.onGet('/statistics/monthly').reply(200, [{ id: 1, idUser: 7, month: '03-2024', average_hours_worked: 8 }]);
    marcajes.onGet('/statistics/daily').reply(200, []);
    const mensual = await viewGraphicsService.getMonthlyAverageHours(7);
    expect(mensual.success).toBe(true);
    expect(marcajes.history.get[0].params).toEqual({ userId: 7 });
    expect(await viewGraphicsService.getWeeklyAverageHours(7)).toEqual({ success: true, data: [] });
    marcajes.onGet('/statistics/monthly').networkError();
    marcajes.onGet('/statistics/daily').reply(500);
    expect((await viewGraphicsService.getMonthlyAverageHours(7)).success).toBe(false);
    expect((await viewGraphicsService.getWeeklyAverageHours(7)).success).toBe(false);
  });

  it('el buscador de gráficos usa el mismo endpoint de usuarios', async () => {
    usuarios.onPost('/users/all').reply(201, [perfil]);
    expect((await viewGraphicsService.viewGraphicsService('ana')).success).toBe(true);
    usuarios.onPost('/users/all').reply(500);
    expect((await viewGraphicsService.viewGraphicsService('ana')).success).toBe(false);
  });
});

describe('healthcheck', () => {
  it('responde verdadero solo con un 200', async () => {
    const externo = new MockAdapter(axios);
    externo.onGet('http://ok').reply(200);
    externo.onGet('http://mal').reply(500);
    externo.onGet('http://caido').networkError();
    expect(await healthcheckService('http://ok')).toBe(true);
    expect(await healthcheckService('http://mal')).toBe(false);
    expect(await healthcheckService('http://caido')).toBe(false);
    externo.restore();
  });
});
