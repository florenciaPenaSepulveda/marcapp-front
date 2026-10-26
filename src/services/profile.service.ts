import { usersApi } from './http';
import { mensajeDeError } from '../lib/errors';
import useUserStore from '../stores/useStore';
import { exito, fallo, Resultado, Usuario } from './types';

const profileService = async (): Promise<Resultado<Usuario>> => {
  try {
    const { data } = await usersApi.post<Usuario>('/auth/profile', {});
    const store = useUserStore.getState();
    store.setId(data.id);
    store.setFirstName(data.firstName);
    store.setLastName(data.lastName);
    store.setEmail(data.email);
    store.setBirthday(data.birthday);
    store.setRole(data.role ?? 'user');
    return exito(data);
  } catch (error) {
    return fallo(mensajeDeError(error, 'Could not load your profile.'));
  }
};

export default profileService;
