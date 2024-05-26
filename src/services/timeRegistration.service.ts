import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AxiosError } from 'axios';

const getData = async() => {
    try {
      const token = await AsyncStorage.getItem('tokenLogin');
      console.log("Token dentro de home: ", token);
      return token;
    } catch (error) {
      console.log("Algo falló al obtener el token:", error);
      return null;
    }
  };

const timeRegistrationService = async () => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/timeRegistration`;
    console.log(endpoint);
    const authToken = await getData();

    if(authToken != null) {
        const response = await axios.post(endpoint, {
            token: authToken
        });

        if(response?.status === 201) {
            console.log(response.data);
            return { success: true, data: response.data };
          } else {
            console.log("Error del servidor")
            return { success: false, message: 'Server error' };
          }
    } 
    
  } catch (error: unknown) {
    return { success: false, message: 'Invalid token' };
  }
};
export default timeRegistrationService;

//TENGO TOKEN, NECESITO RUTA PARA CREAR MARCAJE