import axios from 'axios';

export type editTimeRegistrationResponseT = {
  success: boolean;
  data?: string;
  message?: string;
};

const editTimeRegistrationService = async (
  id: number,
  data: { date: string; adminFlag: boolean }
): Promise<editTimeRegistrationResponseT> => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}/marcaje/admin/${id}`;
    const response = await axios.patch(endpoint, data);
    console.log("EditTimeRegistration service response:", response.data);

    if (response.data.success === false) {
      return { success: false, message: response.data.message };
    }
      
    return {
      success: true,
      message: 'Time registration updated successfully!',
      data: response.data
    };
  } catch (error) {
    console.error('Error in editTimeRegistrationService:', error);
    return { success: false, message: 'Something went wrong. Try again later.' };
  }
};

export default editTimeRegistrationService;