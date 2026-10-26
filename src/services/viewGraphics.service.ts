import axios from 'axios';
import useTokenStore from '../stores/tokenStore';
import { useToken } from 'native-base';

const viewGraphicsService = async (searchTerm: string) => {
  try {
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.token;
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/all`;
    const response = await axios.post(endpoint, {
      searchTerm,
    }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (response.status === 201) {
        return { success: true, data: response.data };
    } else {
        return { success: false, message: 'Error in employee search' };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('Error 401: No autorizado.');
            break;
          case 403:
            console.error('Error 403: No posees el permiso necesario para acceder al recurso.');
            break;
          case 500:
            console.error('Error 500: Error del servidor.');
            break;
          default:
            console.error(`Error ${error.response.status}: ${error.response.data}`);
        }
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    } else {
      console.error('Error desconocido:', error);
    }
    return { success: false, message: 'Error desconocido' };
  }
};

const getMonthlyAverageHours = async () => {
    try {
      const tokenStore = useTokenStore.getState();
      const token = tokenStore.token;
      const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/statistics/monthly`;
  
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      if (response.status === 200) {
        console.log("RESPONSE", response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: 'Error fetching monthly average hours' };
      }
    } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            switch (error.response.status) {
              case 401:
                console.error('Error 401: No autorizado.');
                break;
              case 403:
                console.error('Error 403: No posees el permiso necesario para acceder al recurso.');
                break;
              case 500:
                console.error('Error 500: Error del servidor.');
                break;
              default:
                console.error(`Error ${error.response.status}: ${error.response.data}`);
            }
          } else if (error.request) {
            console.error('No se recibió respuesta del servidor:', error.request);
          } else {
            console.error('Error al configurar la solicitud:', error.message);
          }
        } else {
          console.error('Error desconocido:', error);
        }
        return { success: false, message: 'Error desconocido' };
      }
};

const getWeeklyAverageHours = async () => {
  try {
    const tokenStore = useTokenStore.getState();
    const token = tokenStore.token;
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/statistics/daily`;

    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: 'Error fetching daily average hours' };
    }
  } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              console.error('Error 401: No autorizado.');
              break;
            case 403:
              console.error('Error 403: No posees el permiso necesario para acceder al recurso.');
              break;
            case 500:
              console.error('Error 500: Error del servidor.');
              break;
            default:
              console.error(`Error ${error.response.status}: ${error.response.data}`);
          }
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor:', error.request);
        } else {
          console.error('Error al configurar la solicitud:', error.message);
        }
      } else {
        console.error('Error desconocido:', error);
      }
      return { success: false, message: 'Error desconocido' };
    }
};
    

export default { viewGraphicsService, getMonthlyAverageHours, getWeeklyAverageHours};
