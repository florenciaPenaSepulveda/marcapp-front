import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

const usaAlmacenSeguro = Platform.OS !== 'web';

export const secureStorage: StateStorage = {
  getItem: async (clave) => {
    if (!usaAlmacenSeguro) {
      return AsyncStorage.getItem(clave);
    }
    await AsyncStorage.removeItem(clave);
    return SecureStore.getItemAsync(clave);
  },
  setItem: (clave, valor) =>
    usaAlmacenSeguro
      ? SecureStore.setItemAsync(clave, valor)
      : AsyncStorage.setItem(clave, valor),
  removeItem: (clave) =>
    usaAlmacenSeguro
      ? SecureStore.deleteItemAsync(clave)
      : AsyncStorage.removeItem(clave),
};
