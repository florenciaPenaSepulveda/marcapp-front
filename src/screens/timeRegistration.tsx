import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import timeRegistrationService from '../services/timeRegistration.service';
import getRegistrationStateService, {
  EstadoDelDia,
} from '../services/getRegistrationStateService.service';
import { Marcaje } from '../services/types';
import { Badge, Button, Card, Notice, Screen } from '../components/ui';
import { colors, font, shadow, spacing } from '../theme';

const ESTADOS: Record<
  EstadoDelDia,
  { titulo: string; accion: string; color: string; icono: React.ComponentProps<typeof Ionicons>['name']; tono: 'info' | 'success' | 'warning' }
> = {
  0: { titulo: 'You have not checked in', accion: 'Check in', color: colors.success, icono: 'log-in-outline', tono: 'info' },
  1: { titulo: 'You are checked in', accion: 'Check out', color: colors.danger, icono: 'log-out-outline', tono: 'success' },
  2: { titulo: 'Your day is complete', accion: 'Done', color: colors.muted, icono: 'checkmark-done', tono: 'warning' },
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
  const [ahora, setAhora] = useState(moment());

  useEffect(() => {
    const reloj = setInterval(() => setAhora(moment()), 1000);
    return () => clearInterval(reloj);
  }, []);

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

  const estado = registrationState === null ? null : ESTADOS[registrationState];

  return (
    <Screen style={styles.content}>
      <Card style={styles.clock}>
        <Text style={styles.time}>{ahora.format('HH:mm:ss')}</Text>
        <Text style={font.small}>{ahora.format('dddd, D MMMM YYYY')}</Text>
        {estado && (
          <View style={styles.centrado}>
            <Badge label={estado.titulo} tone={estado.tono} />
          </View>
        )}
      </Card>

      <View style={styles.actionArea}>
        {estado ? (
          <Pressable
            onPress={handleRegistration}
            disabled={loading || registrationState === 2}
            accessibilityRole="button"
            accessibilityLabel={estado.accion}
            accessibilityState={{ disabled: loading || registrationState === 2, busy: loading }}
            style={({ pressed }) => [
              styles.bigButton,
              { backgroundColor: estado.color },
              pressed && styles.pressed,
              registrationState === 2 && styles.bigButtonDone,
            ]}
          >
            <Ionicons name={loading ? 'hourglass-outline' : estado.icono} size={46} color="#fff" />
            <Text style={styles.bigButtonText}>{loading ? 'Registering…' : estado.accion}</Text>
          </Pressable>
        ) : errorMessage ? (
          <Button title="Try again" icon="refresh" onPress={fetchRegistrationState} />
        ) : (
          <Text style={font.small}>Loading your status…</Text>
        )}
      </View>

      {errorMessage !== '' && <Notice tone="danger">{errorMessage}</Notice>}

      {timeRegistration && (
        <Notice tone="success">
          {firstName}, your {timeRegistration.type === 'entry' ? 'check-in' : 'check-out'} was registered at{' '}
          {timeRegistration.date.split(' ')[1]}.
        </Notice>
      )}

      <Text style={[font.small, styles.center]}>Your location is requested only when you register.</Text>
      <Button
        title="View weekly summary"
        variant="secondary"
        icon="calendar-outline"
        onPress={() => navigation.navigate('WeeklySummary')}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  center: { textAlign: 'center' },
  centrado: { alignSelf: 'center' },
  clock: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  time: { fontSize: 44, fontWeight: '800', color: colors.text, letterSpacing: 1 },
  actionArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg },
  bigButton: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow,
  },
  bigButtonDone: { opacity: 0.55 },
  bigButtonText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});

export default TimeRegistration;
