import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Box } from 'native-base';
import { Button, Header, Text } from 'react-native-elements';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import timeRegistrationService from '../services/timeRegistration.service';
import getRegistrationStateService, {
  EstadoDelDia,
} from '../services/getRegistrationStateService.service';
import { Marcaje } from '../services/types';
import styles from '../styles/timeRegistration.styles';

const TITULOS: Record<EstadoDelDia, string> = {
  0: 'Register Check-in time',
  1: 'Register Check-out time',
  2: 'Registration Completed',
};

const TimeRegistration = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const firstName = useUserStore((state) => state.firstName);
  const userId = useUserStore((state) => state.id);
  const [timeRegistration, setTimeRegistration] = useState<Marcaje | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [registrationState, setRegistrationState] =
    useState<EstadoDelDia | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchRegistrationState = useCallback(async () => {
    setErrorMessage('');
    const response = await getRegistrationStateService(userId);
    if (response.success) {
      setRegistrationState(response.data);
    } else {
      setErrorMessage(response.message);
    }
  }, [userId]);

  useEffect(() => {
    fetchRegistrationState();
  }, [fetchRegistrationState]);

  const handleRegistration = async () => {
    setLoading(true);
    setErrorMessage('');
    const response = await timeRegistrationService();
    setLoading(false);
    if (response.success) {
      setTimeRegistration(response.data);
      setRegistrationState(response.data.type === 'entry' ? 1 : 2);
    } else {
      setErrorMessage(response.message);
    }
  };

  const completo = registrationState === 2;

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Time Registration',
          style: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <Text style={styles.description}>
        Please select what would you like to do
      </Text>
      <View style={styles.buttonsContainer}>
        {registrationState === null ? (
          errorMessage ? (
            <Button
              title="Try again"
              onPress={fetchRegistrationState}
              buttonStyle={styles.button}
              titleStyle={styles.buttonTitle}
            />
          ) : (
            <Text>Loading...</Text>
          )
        ) : (
          <Button
            title={TITULOS[registrationState]}
            onPress={handleRegistration}
            loading={loading}
            buttonStyle={[
              styles.button,
              registrationState === 0 && styles.checkInButton,
              registrationState === 1 && styles.checkOutButton,
            ]}
            titleStyle={styles.buttonTitle}
            disabled={completo}
          />
        )}
        <Button
          title="My Weekly Summary"
          onPress={() => navigation.navigate('WeeklySummary')}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
        />
      </View>

      {errorMessage !== '' && (
        <Text style={styles.errorMessage} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}

      {timeRegistration && (
        <View style={styles.registrationInfo}>
          <Text>
            {firstName}, your {timeRegistration.type} has been registered at{' '}
            {timeRegistration.date}
          </Text>
          <Text>Registration ID: {timeRegistration.id}</Text>
          {timeRegistration.type === 'entry' ? (
            <Text style={styles.checkInMessage}>
              You have successfully checked in!
            </Text>
          ) : (
            <Text style={styles.checkOutMessage}>
              You have successfully checked out!
            </Text>
          )}
        </View>
      )}
    </Box>
  );
};

export default TimeRegistration;
