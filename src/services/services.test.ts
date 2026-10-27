import MockAdapter from 'axios-mock-adapter';
import { marcajeApi, usersApi } from './http';
import loginService from './login.service';
import profileService from './profile.service';
import registerService from './register.service';
import editService from './editprofile.service';
import getRegistrationStateService from './getRegistrationStateService.service';
import weeklySummaryService from './weeklySummary.service';
import {
  addTimeRegistrationService,
  deleteTimeRegistrationService,
  deleteWorkerService,
  searchWorkerService,
  summaryService,
  teamStatusService,
  userStatsService,
} from './searchWorker.service';
import changePasswordService from './password.service';
import editTimeRegistrationService from './editTimeRegistration.service';
import viewGraphicsService from './viewGraphics.service';
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
  const pagina = { items: [perfil], total: 41, limit: 20, offset: 0 };

  it('lista trabajadores con paginación y omite el término vacío', async () => {
    usuarios.onGet('/users').reply(200, pagina);
    expect(await searchWorkerService('  ')).toEqual({ success: true, data: pagina });
    expect(usuarios.history.get[0].params).toEqual({ search: undefined, limit: 20, offset: 0 });
    await searchWorkerService(' ana ', 20);
    expect(usuarios.history.get[1].params).toEqual({ search: 'ana', limit: 20, offset: 20 });
    usuarios.onGet('/users').reply(403);
    expect((await searchWorkerService('x')).success).toBe(false);
  });

  it('consulta el estado de hoy del equipo y los totales de usuarios', async () => {
    const estado = [{ idUser: 7, state: 'working', checkIn: '11-03-2024 09:00:00', checkOut: null }];
    marcajes.onGet('/marcaje/admin/today').reply(200, estado);
    expect(await teamStatusService()).toEqual({ success: true, data: estado });
    marcajes.onGet('/marcaje/admin/today').reply(403);
    expect((await teamStatusService()).success).toBe(false);

    const totales = { total: 10, admins: 2, workers: 8, newThisMonth: 1 };
    usuarios.onGet('/users/stats').reply(200, totales);
    expect(await userStatsService()).toEqual({ success: true, data: totales });
    usuarios.onGet('/users/stats').networkError();
    expect((await userStatsService()).success).toBe(false);
  });

  it('pide el resumen de horas con el trabajador y el período opcionales', async () => {
    const resumen = { from: '2024-03-01', to: '2024-03-31', daysWorked: 2, totalHours: 16, averageHoursPerDay: 8, incompleteDays: 0, perUser: [] };
    marcajes.onGet('/statistics/summary').reply(200, resumen);
    expect(await summaryService(7, '01-03-2024', '31-03-2024')).toEqual({ success: true, data: resumen });
    expect(marcajes.history.get[0].params).toEqual({ userId: 7, from: '01-03-2024', to: '31-03-2024' });
    marcajes.onGet('/statistics/summary').reply(400, { message: 'Dates must use the format DD-MM-YYYY' });
    expect(await summaryService()).toEqual({ success: false, message: 'Dates must use the format DD-MM-YYYY' });
  });

  it('elimina un marcaje', async () => {
    marcajes.onDelete('/marcaje/admin/4').reply(200, { success: true });
    expect(await deleteTimeRegistrationService(4)).toEqual({ success: true, data: undefined });
    marcajes.onDelete('/marcaje/admin/4').reply(404);
    expect((await deleteTimeRegistrationService(4)).success).toBe(false);
  });

  describe('deleteWorkerService', () => {
    it('elimina al usuario y luego sus marcajes', async () => {
      usuarios.onDelete('/users/7').reply(200, { success: true });
      marcajes.onDelete('/marcaje/admin/user/7').reply(200, { success: true, deleted: 4 });
      expect(await deleteWorkerService(7)).toEqual({ success: true, data: { registrationsRemoved: true } });
      expect(usuarios.history.delete).toHaveLength(1);
      expect(marcajes.history.delete).toHaveLength(1);
    });

    it('no toca los marcajes si no se pudo eliminar al usuario', async () => {
      usuarios.onDelete('/users/7').reply(400, { message: 'You cannot delete the last administrator' });
      expect(await deleteWorkerService(7)).toEqual({
        success: false,
        message: 'You cannot delete the last administrator',
      });
      expect(marcajes.history.delete).toHaveLength(0);
    });

    it('informa cuando el usuario se eliminó pero no sus marcajes', async () => {
      usuarios.onDelete('/users/7').reply(200, { success: true });
      marcajes.onDelete('/marcaje/admin/user/7').networkError();
      expect(await deleteWorkerService(7)).toEqual({ success: true, data: { registrationsRemoved: false } });
    });
  });

  it('cambia la contraseña enviando la actual y la nueva', async () => {
    useTokenStore.setState({ token: 'token-viejo' });
    usuarios.onPatch('/users/password').reply(200, { message: 'Password updated', access_token: 'token-nuevo' });
    expect((await changePasswordService('Actual12345', 'Nueva12345')).success).toBe(true);
    expect(useTokenStore.getState().token).toBe('token-nuevo');
    expect(JSON.parse(usuarios.history.patch[0].data)).toEqual({
      currentPassword: 'Actual12345',
      newPassword: 'Nueva12345',
    });
    useTokenStore.setState({ token: 'sesion-activa' });
    usuarios.onPatch('/users/password').reply(400, { message: 'Current password is incorrect' });
    expect(await changePasswordService('x', 'Nueva12345')).toEqual({
      success: false,
      message: 'Current password is incorrect',
    });
    expect(cerrarSesion).not.toHaveBeenCalled();
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
});
