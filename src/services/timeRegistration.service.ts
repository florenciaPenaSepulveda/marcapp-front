import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AxiosError } from 'axios';
import useTokenStore from '../stores/tokenStore';

interface MarcajeDto {
  id: number,
  id_user: number,
  date: string,
  type: string,
}

interface SuccessResponseDto {
  success: boolean,
  data: MarcajeDto,
}

interface FailureResponseDto {
  success: boolean,
  message: string
}


/*
const getData = async() => {
    try {
      const tokenStore =  useTokenStore();
      const token =  tokenStore.token;
      console.log("Token dentro de home: ", token);
      return token;
    } catch (error) {
      console.log("Algo falló al obtener el token:", error);
      return null;
    }
  };
*/

const timeRegistrationService = async () => {
  try {
    const tokenStore = useTokenStore.getState();
    const authToken = tokenStore.token;
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/marcaje`;
    console.log(endpoint);
    console.log("Token almacenado en Store: ", authToken);

    if(authToken != null) {
        const response = await axios.post(endpoint, {
            token: authToken
        });
        console.log('Respuesta:', response.data);
        console.log("Token no nulo")
        if(response.data.success) {
            const okResponse: SuccessResponseDto = response.data;
            console.log("Response data :", okResponse.data);
            const marcaje: MarcajeDto = okResponse.data;
            return { success: true, data: marcaje };
          } else {
            const badResponse: FailureResponseDto = response.data;
            console.log("Mensaje de error:", badResponse.message);
            return { success: false, message: badResponse.message };
          }
    } 
    
  } catch (error: unknown) {
    return { success: false, message: 'Invalid token' };
  }
};
export default timeRegistrationService;

//TENGO TOKEN, NECESITO RUTA PARA CREAR MARCAJE