import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';

const loginService = async (payload: { email: string; password: string }) => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/login`;
    console.log('Endpoint: ' + endpoint);
    const response = await axios.post(endpoint, {
      email: payload.email,
      pass: payload.password
    });
    console.log('Respuesta desde BackEnd: ' + JSON.stringify(response.data));
    console.log('Status respuesta: ' + response?.status);
    
    if (response?.data.access_token) {
      await AsyncStorage.setItem('tokenLogin', response?.data.access_token);
      const storedToken = await AsyncStorage.getItem('tokenLogin');
      console.log('TOKEN:', response.data.access_token);
      console.log('TOKEN ALMACENADO:', storedToken);
    }
   

    if(response?.status === 200) {
      return { success: true, data: response.data };
    } else {
        console.log("Error del servidor")
        return { success: false, message: 'Error del servidor' };
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return { success: false, message: 'Credenciales incorrectas' };
      } else {
        return { success: false, message: axiosError.message };
      }
    }
    return { success: false, message: 'Error desconocido' };
  }
};
export default loginService;