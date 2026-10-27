jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const memoria = new Map();
  return {
    getItemAsync: jest.fn(async (clave) => (memoria.has(clave) ? memoria.get(clave) : null)),
    setItemAsync: jest.fn(async (clave, valor) => {
      memoria.set(clave, valor);
    }),
    deleteItemAsync: jest.fn(async (clave) => {
      memoria.delete(clave);
    }),
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

jest.mock('expo-crypto', () => {
  let contador = 0;
  return {
    randomUUID: jest.fn(() => `00000000-0000-4000-8000-${String(++contador).padStart(12, '0')}`),
  };
});
