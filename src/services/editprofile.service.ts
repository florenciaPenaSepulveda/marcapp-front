import axios from 'axios';

export type editServiceResponseT = {
  success: boolean;
  data?: string;
  message?: string;
};

const editService = async (
  data: Record<string, string>
): Promise<editServiceResponseT> => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/users/editProfile`;
    const response = await axios.put(endpoint, data);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: unknown) {
    return { success: false, message: 'Something went wrong. Try again later.' };
  }
};

export default editService;
