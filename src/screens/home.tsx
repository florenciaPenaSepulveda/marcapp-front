import React, { useEffect } from 'react';
import { Box } from 'native-base'; // Importa el componente Box de native-base
import useStore from '../stores/useStore'; // Ajusta la ruta según tu estructura de archivos
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Text, Alert, Button } from 'react-native';

const Home = () => {
  const { email } = useStore();

  useEffect(() => {
    const getData = async () => {
      try {
        const token = await AsyncStorage.getItem('tokenLogin');
        console.log("Token dentro de home: ", token);
      } catch (error) {
        console.log("Algo falló al obtener el token:", error);
      }
    };

    getData();
  }, []);


  return (
    <View>
      <Text style={styles.title}>
        The title and onPress handler are required. It is recommended to set
        accessibilityLabel to help make your app usable by everyone.
      </Text>
      <Button
        title="Press me"
        onPress={() => Alert.alert('Simple Button pressed')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});


export default Home;
