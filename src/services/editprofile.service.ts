import axios from 'axios';
import useUserStore from '../stores/useStore';

export type editServiceResponseT = {
  success: boolean;
  data?: string;
  message?: string;
};

const editService = async (
  data: { firstName: string; lastName: string }
): Promise<editServiceResponseT> => {
  try {
    const userStore = useUserStore.getState();
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/${userStore.id}`;
    const response = await axios.patch(endpoint, data);
    console.log("EditProfile service")
    console.log(response.data);
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in editService:', error);
    return { success: false, message: 'Something went wrong. Try again later.' };
  }
};

export default editService;