import axios from 'axios';

const loginService = async (payload: { user: string; password: string }) => {
  try {
    const url = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth`;
    const response = await axios.post(url, payload);

    return response?.status === 201 ? response?.data : { data: undefined };
  } catch (error: unknown) {
    console.log(error);
    return { status: 500 };
  }
};

export default loginService;
