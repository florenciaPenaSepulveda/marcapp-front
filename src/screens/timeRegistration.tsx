import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import usePendingStore from '../stores/pendingStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import timeRegistrationService, {
  ResultadoDeRegistro,
} from '../services/timeRegistration.service';
import getRegistrationStateService, {
  EstadoDelDia,
} from '../services/getRegistrationStateService.service';
import { diaLocal, estadoLocal } from '../lib/estadoLocal';
import { SyncBanner } from '../components/SyncBanner';
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
  const knownState = usePendingStore((state) => state.knownState);
  const pending = usePendingStore((state) => state.pending);
  const setKnownState = usePendingStore((state) => state.setKnownState);
  const [resultado, setResultado] = useState<ResultadoDeRegistro | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [ahora, setAhora] = useState(moment());

  useEffect(() => {
    const reloj = setInterval(() => setAhora(moment()), 1000);
    return () => clearInterval(reloj);
  }, []);

  const refrescarEstado = useCallback(async () => {
    const respuesta = await getRegistrationStateService(userId);
    if (respuesta.success) {
      setKnownState({ userId, day: diaLocal(), state: respuesta.data });
    }
  }, [userId, setKnownState]);

  useEffect(() => {
    refrescarEstado();
  }, [refrescarEstado]);

  const estadoActual = useMemo(
    () => estadoLocal(userId, knownState, pending),
    [userId, knownState, pending],
  );
  const estado = ESTADOS[estadoActual];

  const handleRegistration = async () => {
    setLoading(true);
    setErrorMessage('');
    const respuesta = await timeRegistrationService();
    setLoading(false);
    if (respuesta.success) {
      setResultado(respuesta.data);
    } else {
      setErrorMessage(respuesta.message);
    }
  };

  const mensajeDeResultado = () => {
    if (!resultado) {
      return null;
    }
    if (resultado.mode === 'online') {
      const tipo = resultado.marca.type === 'entry' ? 'check-in' : 'check-out';
      return (
        <Notice tone="success">
          {firstName}, your {tipo} was registered at {resultado.marca.date.split(' ')[1]}.
        </Notice>
      );
    }
    const tipo = resultado.pendiente.type === 'entry' ? 'check-in' : 'check-out';
    return (
      <Notice tone="warning">
        No signal. Your {tipo} of {moment(resultado.pendiente.recordedAt).format('HH:mm')} was saved on this device and will be sent automatically.
      </Notice>
    );
  };

  return (
    <Screen style={styles.content}>
      <Card style={styles.clock}>
        <Text style={styles.time}>{ahora.format('HH:mm:ss')}</Text>
        <Text style={font.small}>{ahora.format('dddd, D MMMM YYYY')}</Text>
        <View style={styles.centrado}>
          <Badge label={estado.titulo} tone={estado.tono} />
        </View>
      </Card>

      <SyncBanner />

      <View style={styles.actionArea}>
        <Pressable
          onPress={handleRegistration}
          disabled={loading || estadoActual === 2}
          accessibilityRole="button"
          accessibilityLabel={estado.accion}
          accessibilityState={{ disabled: loading || estadoActual === 2, busy: loading }}
          style={({ pressed }) => [
            styles.bigButton,
            { backgroundColor: estado.color },
            pressed && styles.pressed,
            estadoActual === 2 && styles.bigButtonDone,
          ]}
        >
          <Ionicons name={loading ? 'hourglass-outline' : estado.icono} size={46} color="#fff" />
          <Text style={styles.bigButtonText}>{loading ? 'Registering…' : estado.accion}</Text>
        </Pressable>
      </View>

      {errorMessage !== '' && <Notice tone="danger">{errorMessage}</Notice>}
      {mensajeDeResultado()}

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
