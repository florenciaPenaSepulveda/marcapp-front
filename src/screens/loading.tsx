import { View } from 'react-native';
import healthcheckService from '../services/healthcheck.service';
import { useEffect, useState } from 'react';
import { Spinner, Text } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Router';
import { Button } from 'react-native-elements';

const Loading = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string>();

  const getHealthcheck = async () => {
    setLoading(true);
    const res = await healthcheckService();

    if (res.status === 200) {
      navigation.navigate('Login');
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
            style={{
              paddingVertical: '5%',
              textAlign: 'center',
              fontSize: 24,
              fontWeight: '700',
            }}
          >
            {errorMessage}
          </Text>
          <Button
            title={'Volver a intentar'}
            onPress={() => getHealthcheck()}
          />
        </View>
      ) : (
        <View>
          <Spinner size="xl" />
          <Text
            size="container"
            style={{
              paddingVertical: '5%',
              textAlign: 'center',
              fontSize: 24,
              fontWeight: '700',
            }}
          >
            Iniciando
          </Text>
        </View>
      )}
    </View>
  );
};

export default Loading;
