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
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
