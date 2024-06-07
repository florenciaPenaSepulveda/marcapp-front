// Importar useState
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import { Button, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import timeRegistrationService from '../services/timeRegistration.service';
import searchWorkerService from '../services/searchWorker.service'

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { firstName } = useUserStore();

  const goProfile = () => {
    navigation.navigate("Profile");
  }

  const goTimeRegistration = () => {
    navigation.navigate("TimeRegistration");
  }

  const goSearchWorker = () => {
    navigation.navigate("SearchWorker");
  }

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
  }, []);

  return (
    <Box
      style={{
        flex: 1,
        alignContent: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
        paddingHorizontal: '10%',
        paddingVertical: '5%'
      }}
    >
      <Text
        style={{
          fontSize: 24,
          textAlign: 'center',
          fontWeight: '700',
          marginVertical: '10%',
        }}
      >
        Nice to see you again on MarcApp, {firstName}!
      </Text>
      <View style={styles.buttonsContainer}>
        <Button
        title="View Profile"
        onPress={goProfile}
        loading={loading}
        buttonStyle={styles.button}
        containerStyle={[styles.buttonContainer, { top: 150, left: 20 }]}
        titleStyle={styles.buttonTitle}/>

        <Button 
        title="Add Time Registration"
        onPress={goTimeRegistration}
        loading={loading}
        buttonStyle={styles.button}
        containerStyle={[styles.buttonContainer, { top: 150, left: 190 }]}
        titleStyle={styles.buttonTitle}/>

        <Button 
        title="Search worker" 
        onPress={goSearchWorker} 
        loading={loading}
        buttonStyle={styles.button}
        containerStyle={[styles.buttonContainer, { top: 300, left: 105 }]}
        titleStyle={styles.buttonTitle}
        />
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  button: {
    height: 120, // Ajusta la altura del botón aquí
    width: 150, // Ajusta el ancho del botón aquí
  },
  buttonContainer: {
    position: 'absolute',
  },
  buttonTitle: {
    fontSize: 19, // Tamaño de la fuente del texto del botón
    fontWeight: 'bold', // Peso de la fuente del texto del botón
    color: 'white', // Color del texto del botón
  },
});

export default Home;
