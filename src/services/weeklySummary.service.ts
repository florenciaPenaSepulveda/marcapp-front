import axios from 'axios';
import moment from 'moment';

const weeklySummaryService = async (startDate: string, endDate: string, idUser: number) => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/marcaje/date/${idUser}`;
    console.log('Entrada:', startDate);
    console.log('Salida:', endDate);
    // Convertir las fechas a un objeto PeriodDto
    const PeriodDto = {
      startDate: startDate,
      endDate: endDate
    };
    const response = await axios.post(endpoint, PeriodDto);
    console.log(response.data);
    return { success: true, data: response.data}

  } catch (error: unknown) {
    return { success: false, message: 'Ocurrió un problema' };
  }
};

export default weeklySummaryService;