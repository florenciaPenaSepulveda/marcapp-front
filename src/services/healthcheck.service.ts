import axios from 'axios';

const healthcheckService = async () => {
  try {
    const url = "http://192.168.1.167:3001/";
    //Usar 10.0.0.2 si falla

    const response = await axios.get(url, { timeout: 5000 });
    return response;
  } catch (e: unknown) {
    const error = (e as Record<string, Record<string, unknown>>);
    if (error.response) {
        // La solicitud fue hecha y el servidor respondió con un estado diferente de 2XX
        console.error('Error de respuesta del servidor:', error.response.data);
        console.error('Estado de respuesta:', error.response.status);
        console.error('Cabeceras de respuesta:', error.response.headers);
    } else if (error.request) {
        // La solicitud fue hecha pero no se recibió ninguna respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
    } else {
        // Ocurrió un error durante la solicitud
        console.error('Error al realizar la solicitud:', error.message);
    }
    console.error('Configuración de error:', error.config);
    return { status: 500 }; // Retornar un objeto de estado 500 en caso de error
  }
};

export default healthcheckService;