import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import { Button, Header, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import timeRegistrationService from '../services/timeRegistration.service';

interface MarcajeDto {
  id: number,
  id_user: number,
  date: string,
  type: string,
}

const TimeRegistration = () => { 
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userStore = useUserStore();
  const { email, firstName } = userStore;
  const [timeRegistration, setTimeRegistration] = useState({ date: '', id: 0, id_user: 0, type: '' });
  const [loading, setLoading] = useState<boolean>(false);

  const getArrival = async () => {
    try {
      setLoading(true);
      const response = await timeRegistrationService();
      if(response?.success) {
        console.log(response.data);
        setTimeRegistration(response.data as MarcajeDto);
        setLoading(false);
      } else {
        console.log(response?.message);
        setLoading(false);
      }
    } catch (error) {
      console.log("Ocurrió un problema");
      setLoading(false);
    }
  }

  const getExit = async () => {
    try {
      setLoading(true);
      const response = await timeRegistrationService();
      if(response?.success) {
        console.log(response.data);
        setTimeRegistration(response.data as MarcajeDto);
        setLoading(false);
      }
    } catch (error) {
      console.log("Ocurrió un problema");
      setLoading(false);
    }
  }

  const goSummary = () => {
    navigation.navigate("WeeklySummary");
  }

  const [buttons, setButtons] = useState([
    { title: 'Register Check-in time', onPress: getArrival, position: { top: 20, left: 20 } },
    { title: 'Register Check-out time', onPress: getExit, position: { top: 20, left: 190 } },
    { title: 'My Weekly Summary', onPress: goSummary, position: { top: 170, left: 105 } },
  ]);

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Time Registration',
          style: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <Text
        style={{
          fontSize: 20,
          justifyContent: 'flex-start',
          fontWeight: '600',
          marginVertical: '10%',
          paddingHorizontal: '0%',
          color: 'gray',
        }}
      >
        Please select what would you like to do
      </Text>
      <View style={styles.buttonsContainer}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            title={button.title}
            onPress={button.onPress}
            loading={loading}
            buttonStyle={styles.button}
            containerStyle={[styles.buttonContainer, button.position]}
            titleStyle={styles.buttonTitle} // Aplicar estilo de fuente al texto del botón
          />
        ))}
      </View>

      {(timeRegistration.id !== 0 && timeRegistration.date !== '' && timeRegistration.id_user !== 0) && (
        <View style={styles.registrationInfo}>
          <Text>{firstName}, your {timeRegistration.type} has been registered at {timeRegistration.date}</Text>
          <Text>Registration ID: {timeRegistration.id} </Text>
        </View>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: '0%',
    paddingVertical: '0%',
  },
  buttonsContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  button: {
    height: 120, // Puedes ajustar la altura del botón aquí
    width: 150, // Puedes ajustar el ancho del botón aquí
  },
  buttonContainer: {
    position: 'absolute',
  },
  buttonTitle: {
    fontSize: 19, // Tamaño de la fuente del texto del botón
    fontWeight: 'bold', // Peso de la fuente del texto del botón
    color: 'white', // Color del texto del botón
  },
  registrationInfo: {
    marginTop: 50,
    alignItems: 'center',
  },
});

export default TimeRegistration;
