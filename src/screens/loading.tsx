import { View } from 'react-native';
import healthcheckService from '../services/healthcheck.service';
import { useEffect, useState } from 'react';
import { Spinner, Text } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Router';
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/loading.styles';

const Loading = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string>();

  const getHealthcheck = async () => {
    setLoading(true);
    const url: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}`;
    console.log("URL UserMS: ", url);

    const url2: string = `${process.env.EXPO_PUBLIC_MS_TIMEREGISTRATION_URL}`;
    console.log("URL TimeRegistrationMS:" , url2)
    const res = await healthcheckService(url);
    const res2 = await healthcheckService(url2);

    if ((res.status === 200) && (res2.status === 200)) {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.navigate('Home');
      } else {
       navigation.navigate('Login');
       //navigation.navigate('Home');
      }
    } else {
      setLoading(false);
      setErrorMessage('Problemas al conectar con el servidor');
    }
  };

  useEffect(() => {
    getHealthcheck();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      {errorMessage && !loading ? (
        <View style={{ paddingHorizontal: '5%' }}>
          <Text
            size="container"
            style={styles.container}
          >
            {errorMessage}
          </Text>
          <Button
            title={'Try again'}
            onPress={() => getHealthcheck()}
          />
        </View>
      ) : (
        <View>
          <Spinner size="xl" />
          <Text
            size="container"
            style={styles.container}
          >
            Iniciando
          </Text>
        </View>
      )}
    </View>
  );
};


export default Loading;
