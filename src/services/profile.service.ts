import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useUserStore from '../stores/useStore';
import useTokenStore from '../stores/tokenStore';

interface ResponseDto {
    birthday: string;
    email: string;
    exp: number;
    firstName: string;
    iat: number;
    id: number;  
    lastName: string;
    role: string;
  }
  
  interface ErrorResponse {
    message: string;
    statusCode: number;
  }

  async function guardarUsuario(usuario: ResponseDto) {
    const userStore = useUserStore.getState(); //para que no sea reactivo (Sólo se actualice cuando se llame a la función)
    userStore.setId(usuario.id);
    userStore.setFirstName(usuario.firstName);
    userStore.setLastName(usuario.lastName);
    userStore.setEmail(usuario.email);
    userStore.setBirthday(usuario.birthday);
    userStore.setRole(usuario.role);
    
  }

const getData = async() => {
    try {
      const token = useTokenStore.getState().token;
      return token;
    } catch (error) {
      console.log("Algo falló al obtener el token:", error);
      return null;
    }
  };

const profileService = async () => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/profile`;
    const authToken = await getData();
    const response = await axios.post<ResponseDto | ErrorResponse>(endpoint, {}, {
        headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
        }
      });
      console.log(response.data);
      await guardarUsuario(response.data as ResponseDto);
      return { success: true }    
    
  } catch (error: unknown) {
    console.log("Token inválido en profile Service")
    return { success: false, message: 'Token inválido' };
  }
};
export default profileService;
