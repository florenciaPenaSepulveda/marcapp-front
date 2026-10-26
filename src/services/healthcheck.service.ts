
import axios, { AxiosResponse } from 'axios';

const healthcheckService = async (url: string): Promise<AxiosResponse<any> | { status: number }> => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response;
  } catch (e: unknown) {
    const error = e as Record<string, Record<string, unknown>>;
    if (error.response) {
      console.error('Error de respuesta del servidor:', error.response.data);
      console.error('Estado de respuesta:', error.response.status);
      console.error('Cabeceras de respuesta:', error.response.headers);
      console.error('Servidor que falla:', url)
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', url);
      console.error(error.request);
    } else {
      console.error('Error al realizar la solicitud:', error.message);
    }
    console.error('Configuración de error:', error.config);
    return { status: 500 };
  }
};

export default healthcheckService;