import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';

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

interface TimeRegistration {
  date: string;
  id: number;
  id_user: number;
}

const weeklySummaryService = async (startDate: moment.Moment, endDate: moment.Moment) => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/weeklySummary`;
    const authToken = await getData();

    if (!authToken) {
      return { success: false, message: 'Invalid token or not found' };
    }

    const response = await axios.post<TimeRegistration[]>(endpoint, {
      token: authToken,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    if (response?.status === 200) {
      console.log(response.data);
      return { success: true, data: response.data };
    } else {
      console.log("Error del servidor");
      return { success: false, message: 'Server error' };
    }
  } catch (error: unknown) {
    return { success: false, message: 'Invalid token' };
  }
};

export default weeklySummaryService;