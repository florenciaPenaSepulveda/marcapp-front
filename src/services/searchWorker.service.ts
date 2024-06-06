import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';

const searchWorkerService = async (searchTerm: string) => {
  try {
    // Puedes obtener el token de autenticación desde AsyncStorage si es necesario
    const token = await AsyncStorage.getItem('authToken');
    
    // Configuración de la solicitud
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Llamada a la API para buscar empleados
    const response = await axios.get(`https://api.tu-dominio.com/empleados?search=${searchTerm}`, config);

    // Procesar la respuesta y devolver los datos
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Error en la búsqueda de empleados');
    }
  } catch (error) {
    console.error('Error al buscar empleados:', error);
    throw error;
  }
};

export default searchWorkerService;
