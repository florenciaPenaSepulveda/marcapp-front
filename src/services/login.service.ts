import axios from 'axios';

const loginService = async (payload: { email: string; password: string }) => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/${payload.email}`;
    console.log('Endpoint: ' + endpoint);
    const response = await axios.get(endpoint);
    console.log('Respuesta desde BackEnd: ' + JSON.stringify(response.data));
    console.log('Status respuesta: ' + response?.status);
    console.log('Contraseña data: ' + response?.data.pass);
    console.log('Contraseña payload: ' + payload.password);
    
    if(response?.status === 200 && response?.data.pass === payload.password) {
      console.log('Log desde service responde.data = ' + JSON.stringify(response?.data));
      return { success: true, data: response.data };
    } else {
      console.log('Credenciales incorrectas');
      return { success: false, message: 'Credenciales incorrecta' };
    }
  } catch (error: unknown) {
    return { success: false, message: 'Error de servidor' };
  }
};

export default loginService;
