import axios from 'axios';

export type RegisterServiceResponseT = {
  success: boolean;
  data?: string;
  message?: string; // Cambiado de error a message
};

const registerService = async (
  data: Record<string, string>
): Promise<RegisterServiceResponseT> => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/register`;
    const response = await axios.post(endpoint, data);
    return { success: true, data: response.data };
    
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (Array.isArray(error.response.data.message)) {
              // Si es un array de mensajes, podrías combinarlos en un solo mensaje o manejarlos como necesites
              const errorMessage = error.response.data.message.join(', ');
              return { success: false, message: errorMessage };
            } else {
              // Si es un solo mensaje
              return { success: false, message: error.response.data.message };
            }
          case 409:
            return { success: false, message: 'Email en uso' };
          default:
            return { success: false, message: `Error ${error.response.status}: ${error.response.data}`}
        }
      } else if (error.request) {
        return {success: false, message: `No se recibió respuesta del servidor: ${error.request}`};
        };
      } else {
        return {success: false, message: `Error al configurar solicitud`};
      }
    } 
    return { success: false, message: 'Error desconocido' };
};

export default registerService;