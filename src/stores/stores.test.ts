import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { secureStorage } from './secureStorage';
import useTokenStore from './tokenStore';
import useUserStore from './useStore';

jest.mock('../navigation', () => ({ reiniciarEnLogin: jest.fn() }));

import { reiniciarEnLogin } from '../navigation';
import { cerrarSesion, haySesion } from '../session';

describe('almacén seguro', () => {
  const original = Platform.OS;

  afterEach(() => {
    Platform.OS = original;
    jest.clearAllMocks();
  });

  it('guarda el token en SecureStore en el teléfono y elimina el rastro heredado', async () => {
    await AsyncStorage.setItem('token-store-storage', 'heredado');
    await secureStorage.setItem('token-store-storage', 'secreto');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token-store-storage', 'secreto');
    expect(await secureStorage.getItem('token-store-storage')).toBe('secreto');
    expect(await AsyncStorage.getItem('token-store-storage')).toBeNull();
    await secureStorage.removeItem('token-store-storage');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token-store-storage');
  });
});

describe('sesión', () => {
  beforeEach(() => {
    useTokenStore.setState({ token: '' });
    useUserStore.getState().clearUser();
    jest.clearAllMocks();
  });

  it('haySesion refleja la presencia del token', () => {
    expect(haySesion()).toBe(false);
    useTokenStore.getState().setToken('abc');
    expect(haySesion()).toBe(true);
  });

  it('cerrar sesión borra el token y los datos del usuario y vuelve al ingreso', () => {
    useTokenStore.getState().setToken('abc');
    const usuario = useUserStore.getState();
    usuario.setId(4);
    usuario.setFirstName('Ana');
    usuario.setRole('admin');
    cerrarSesion();
    expect(useTokenStore.getState().token).toBe('');
    expect(useUserStore.getState()).toMatchObject({ id: 0, firstName: '', role: '' });
    expect(reiniciarEnLogin).toHaveBeenCalledTimes(1);
  });

  it('el store de usuario actualiza cada campo', () => {
    const u = useUserStore.getState();
    u.setLastName('Pérez');
    u.setEmail('ana@test.cl');
    u.setBirthday('1995-04-20');
    expect(useUserStore.getState()).toMatchObject({ lastName: 'Pérez', email: 'ana@test.cl', birthday: '1995-04-20' });
  });

  it('el token queda marcado como hidratado al iniciar', () => {
    expect(useTokenStore.getState().hydrated).toBe(true);
  });
});
