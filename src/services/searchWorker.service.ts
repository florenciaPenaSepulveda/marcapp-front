import axios from 'axios';
import useTokenStore from '../stores/tokenStore';

const searchWorkerService = async (searchTerm: string) => {
  try {
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.token;
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/all`;

    console.log('Token:', token);
    console.log('Endpoint:', endpoint);

    const response = await axios.post(endpoint, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.status);

    if (response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Error en la búsqueda de empleados' };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('Error 401: No autorizado.');
            break;
          case 403:
            console.error('Error 403: No posees el permiso necesario para acceder al recurso.');
            break;
          case 500:
            console.error('Error 500: Error del servidor.');
            break;
          default:
            console.error(`Error ${error.response.status}: ${error.response.data}`);
        }
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    } else {
      console.error('Error desconocido:', error);
    }
    return { success: false, message: 'Error desconocido' };
  }
};


const addTimeRegistrationService = async (date: string, idUser: number) => {
  try {
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.token;
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/marcaje/admin`;
    console.log(endpoint);
    const response = await axios.post(endpoint, {
      token,
      idUser: idUser,
      date,
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Error al agregar el marcaje' };
    }
  } catch (error) {
    console.error('Error al agregar el marcaje:', error);
    return { success: false, message: 'Error desconocido' };
  }
};

export { searchWorkerService, addTimeRegistrationService};