import axios from 'axios';
import useUserStore from '../stores/useStore';
import useTokenStore from '../stores/tokenStore';

export type editServiceResponseT = {
  success: boolean;
  data?: string;
  message?: string;
};

const editService = async (
  data: { firstName: string; lastName: string }
): Promise<editServiceResponseT> => {
  try {
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.token;
    const headers = {
      Authorization: `Bearer ${token}`  // Agregar el token de autorización en los headers
    };
    const userStore = useUserStore.getState();
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/`;
    const response = await axios.patch(endpoint, data, { headers });
    console.log("EditProfile service")
    console.log(response.data);
    return {
      success: true,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (Array.isArray(error.response.data.message)) {
              // Si es un array de mensajes, podrías combinarlos en un solo mensaje o manejarlos como necesites
              const errorMessage = error.response.data.message.join(', ');
              console.error(errorMessage);
              return { success: false, message: errorMessage };
            } else {
              console.error(error.response.data.message);
              return { success: false, message: error.response.data.message };
            }
          case 401:
            console.error(error.message);
            return {success: false, message: error.response.data.message}
          case 500:
            console.error('Error 500: Error del servidor.');
            break;
        }
      } else if (error.request) {
        return {success: false, message: `No se recibió respuesta del servidor: ${error.request}`};
        };
      } else {
        return {success: false, message: `Error al configurar solicitud`};
      }
    return { success: false, message: 'Error desconocido' };
  }
};

export default editService;