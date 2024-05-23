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
    return { success: false, message: 'Correo ya en uso' }; // Cambiado de error a message
  }
};

export default registerService;