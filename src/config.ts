type VariablesPublicas = {
  EXPO_PUBLIC_MS_USER_URL?: string;
  EXPO_PUBLIC_MS_TIMEREGISTRATION_URL?: string;
};

const sinBarraFinal = (url: string | undefined): string =>
  (url ?? '').trim().replace(/\/+$/, '');

export const USERS_URL = sinBarraFinal(
  (process.env as VariablesPublicas).EXPO_PUBLIC_MS_USER_URL,
);
export const MARCAJE_URL = sinBarraFinal(
  (process.env as VariablesPublicas).EXPO_PUBLIC_MS_TIMEREGISTRATION_URL,
);

export const REQUEST_TIMEOUT_MS = 10000;
