import axios from 'axios';
import { AxiosError } from 'axios';
import useTokenStore from '../stores/tokenStore';
import * as Location from 'expo-location';

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

const getLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permiso para acceder a la ubicación denegado');
      return null;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    return { latitude, longitude };
  } catch (error) {
    console.log('Error obteniendo la ubicación:', error);
    return null;
  }
};

const timeRegistrationService = async () => {
  try {
    const tokenStore = useTokenStore.getState();
    const authToken = tokenStore.token;
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/marcaje`;
    console.log(endpoint);
    console.log("Token almacenado en Store: ", authToken);

    if (authToken != null) {
      const location = await getLocation();
      if (location == null) {
        return { success: false, message: 'Your location was not obtained' };
      }

      const { latitude, longitude } = location;
      console.log("Latitud:", latitude.toString());
      console.log("Longitud:", longitude.toString());
      const response = await axios.post(endpoint, {
        token: authToken,
        latCoordinate: latitude.toString(),
        longCoordinate: longitude.toString()
      });

      console.log('Respuesta de MS_Marcaje en timeRegistration:', response.data);
      
      if (response.data.success) {
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
    console.log("Error en timeRegistrationService:", error);
    return { success: false, message: 'Invalid token' };
  }
};

export default timeRegistrationService;