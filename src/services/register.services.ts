import axios from 'axios';

export type RegisterServiceResponseT = {
  success: boolean;
  data?: string;
  error?: string;
};

const registerService = async (
  data: Record<string, string>
): Promise<RegisterServiceResponseT> => {
  try {
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/register`;

    return {
      success: true,
      data: (await axios.post(endpoint, data))?.data?.message,
    };
  } catch (e: unknown) {
    let error = 'Ha ocurrido un error';
    console.log({
      e: (e as Record<string, Record<string, Record<string, unknown>>>)
        ?.response?.data,
    });
    switch (
      (e as Record<string, Record<string, Record<string, unknown>>>)?.response
        ?.data?.message
    ) {
      case 'Entrada duplicada':
        error = 'El email ya esta en uso';
        break;
    }

    return { success: false, error };
  }
};

export default registerService;
