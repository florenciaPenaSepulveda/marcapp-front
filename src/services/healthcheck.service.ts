import axios from 'axios';

const healthcheckService = async (url: string): Promise<boolean> => {
  try {
    const { status } = await axios.get(url, { timeout: 5000 });
    return status === 200;
  } catch {
    return false;
  }
};

export default healthcheckService;
