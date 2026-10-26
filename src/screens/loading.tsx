import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Spinner, Text } from 'native-base';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-elements';
import { RootStackParamList } from '../../Router';
import healthcheckService from '../services/healthcheck.service';
import profileService from '../services/profile.service';
import { MARCAJE_URL, USERS_URL } from '../config';
import useTokenStore from '../stores/tokenStore';
import styles from '../styles/loading.styles';

const Loading = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hydrated = useTokenStore((state) => state.hydrated);
  const [errorMessage, setErrorMessage] = useState<string>();

  const iniciar = useCallback(async () => {
    setErrorMessage(undefined);
    const [usuariosListo, marcajeListo] = await Promise.all([
      healthcheckService(USERS_URL),
      healthcheckService(MARCAJE_URL),
    ]);
    if (!usuariosListo || !marcajeListo) {
      setErrorMessage('Problems connecting to the server.');
      return;
    }

    if (!useTokenStore.getState().token) {
      navigation.replace('Login');
      return;
    }
    const perfil = await profileService();
    if (perfil.success) {
      navigation.replace('Home');
    } else if (!useTokenStore.getState().token) {
      navigation.replace('Login');
    } else {
      setErrorMessage(perfil.message);
    }
  }, [navigation]);

  useEffect(() => {
    if (hydrated) {
      iniciar();
    }
  }, [hydrated, iniciar]);

  return (
    <View style={styles.screen}>
      {errorMessage ? (
        <View style={styles.content}>
          <Text style={styles.container}>{errorMessage}</Text>
          <Button title="Try again" onPress={iniciar} />
        </View>
      ) : (
        <View>
          <Spinner size="xl" accessibilityLabel="Loading" />
          <Text style={styles.container}>Starting</Text>
        </View>
      )}
    </View>
  );
};

export default Loading;
