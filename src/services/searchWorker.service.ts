import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import useTokenStore from '../stores/tokenStore';

const searchWorkerService = async (searchTerm: string) => {
  try {
    // Puedes obtener el token de autenticación desde AsyncStorage si es necesario
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.token;
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/all`;

    const response = await axios.post(endpoint, {}, {
        headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
        }
      });
      console.log(response.data);
    // Procesar la respuesta y devolver los datos
    if (response.status === 201) {
      return { success: true, data: response.data}
    } else {
      return { success: false, message:'Error en la busqueda de empleados'}
    }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // El servidor respondió con un estado diferente de 2xx
          switch (error.response.status) {
            case 401:
              console.error('Error 401: No autorizado.');
              // Maneja el error 401, por ejemplo redirigiendo al login
              break;
            case 403:
              console.error('Error 403: No posees el permiso necesario para acceder al recurso.');
              // Maneja el error 403, por ejemplo mostrando un mensaje de acceso denegado
              break;
            case 500:
              console.error('Error 500: Error del servidor.');
              // Maneja el error 500, por ejemplo mostrando un mensaje de error genérico
              break;
            default:
              console.error(`Error ${error.response.status}: ${error.response.data}`);
              // Maneja otros posibles errores
          }
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('No se recibió respuesta del servidor:', error.request);
        } else {
          // Algo pasó al configurar la solicitud que desencadenó un error
          console.error('Error al configurar la solicitud:', error.message);
        }
      } else {
        // Error no relacionado con Axios
        console.error('Error desconocido:', error);
      }
    }
};

export default searchWorkerService;
