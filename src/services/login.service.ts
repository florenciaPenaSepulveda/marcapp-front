import axios from 'axios';
import { AxiosError } from 'axios';
import useTokenStore from '../stores/tokenStore';

async function guardarToken(token: string) {
  const tokenStore = useTokenStore.getState(); //para que no sea reactivo (Sólo se actualice cuando se llame a la función)
  tokenStore.setToken(token);
}

const loginService = async (payload: { email: string; password: string }) => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/login`;
    const response = await axios.post(endpoint, {
      email: payload.email,
      pass: payload.password
    });
    
    if(response?.status === 200) {
      console.log("Token recibido:", response.data.access_token);
      guardarToken(response.data.access_token);
      return { success: true};
    } else {
      console.log("Error del servidor")
      return { success: false, message: 'Error del servidor' };
    }
  } catch (error: unknown) {
    return { success: false, message: 'Credenciales incorrectas' };
  }
};
export default loginService;
