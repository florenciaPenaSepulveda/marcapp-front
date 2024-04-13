import axios from 'axios';

const healthcheckService = async () => {
  try {
    const url = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth`;

    const response = await axios.get(url, { timeout: 5000 });

    return response;
  } catch (error: unknown) {
    return { status: 500 };
  }
};

export default healthcheckService;
