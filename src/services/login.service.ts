import axios from 'axios';

const loginService = async (payload: { email: string; password: string }) => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/login`;
    const response = await axios.post(endpoint, payload);
    return response?.status === 201 ? response?.data : { data: undefined };
  } catch (error: unknown) {
    return { status: 500 };
  }
};

export default loginService;
