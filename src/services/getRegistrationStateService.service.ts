import axios from "axios";
import moment from "moment";

const getRegistrationStateService = async (idUser: number) => {
  try {
    const today = moment().format('DD-MM-YYYY');
    const tomorrow = moment().add(1, 'days').format('DD-MM-YYYY');
    console.log(today);
    console.log(tomorrow);
    const endpoint = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/marcaje/user/today/${idUser}`;
    console.log(endpoint)
    const response = await axios.post(endpoint, {
      startDate: today, 
      endDate: tomorrow,
    });
    if(response?.status === 201) {
        console.log('Data:', response.data)
        return { success: true, data: response.data};
    } else {
      console.log("Error del servidor")
      console.log(response.status);
      return { success: false, message: 'Error del servidor' };
    }
  } catch (error: unknown) {
    return { success: false, message: 'Ocurrió un error desconocido' };
  }
};
export default getRegistrationStateService;
