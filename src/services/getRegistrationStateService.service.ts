import axios from "axios";

const getRegistrationStateService = async (idUser: number) => {
  try {
    const endpoint = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/marcaje/user/today/${idUser}`;
    console.log(endpoint)
    const response = await axios.get(endpoint);
    if(response?.status === 200) {
        console.log('Data:', response.data)
        return { success: true, data: response.data};
    } else {
      console.log("Error del servidor")
      return { success: false, message: 'Error del servidor' };
    }
  } catch (error: unknown) {
    return { success: false, message: 'Ocurrió un error desconocido' };
  }
};
export default getRegistrationStateService;
