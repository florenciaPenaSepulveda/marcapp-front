import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { cerrarSesion } from '../session';
import { summaryService, teamStatusService, userStatsService } from '../services/searchWorker.service';
import { EstadisticasDeUsuarios, EstadoDeHoy, Resumen } from '../services/types';
import { formatearHoras } from '../lib/horarios';
import { Avatar, Badge, Button, Card, Screen, SectionTitle, StatTile } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

type Destino = 'Profile' | 'TimeRegistration' | 'WeeklySummary' | 'SearchWorker' | 'ViewGraphics';
type Icono = React.ComponentProps<typeof Ionicons>['name'];

const saludo = (): string => {
  const hora = moment().hour();
  if (hora < 12) return 'Good morning';
  if (hora < 20) return 'Good afternoon';
  return 'Good evening';
};

const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const firstName = useUserStore((state) => state.firstName);
  const lastName = useUserStore((state) => state.lastName);
  const role = useUserStore((state) => state.role);
  const [miMes, setMiMes] = useState<Resumen | null>(null);
  const [equipo, setEquipo] = useState<EstadisticasDeUsuarios | null>(null);
  const [hoy, setHoy] = useState<EstadoDeHoy[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (role === 'admin') {
        userStatsService().then((r) => r.success && setEquipo(r.data));
        teamStatusService().then((r) => r.success && setHoy(r.data));
      } else {
        summaryService().then((r) => r.success && setMiMes(r.data));
      }
    }, [role]),
  );

  const trabajando = hoy.filter((estado) => estado.state === 'working').length;
  const terminaron = hoy.filter((estado) => estado.state === 'done').length;

  const opcion = (titulo: string, detalle: string, icono: Icono, destino: Destino) => (
    <Card
      key={destino}
      onPress={() => navigation.navigate(destino)}
      accessibilityLabel={titulo}
      style={styles.tile}
    >
      <View style={styles.tileIcon}>
        <Ionicons name={icono} size={24} color={colors.primary} />
      </View>
      <Text style={font.heading}>{titulo}</Text>
      <Text style={font.small}>{detalle}</Text>
    </Card>
  );

  return (
    <Screen style={styles.content}>
      <View style={styles.greeting}>
        <Avatar name={firstName} size={56} />
        <View style={styles.flex}>
          <Text style={font.small}>{saludo()},</Text>
          <Text style={font.title} numberOfLines={1}>
            {firstName} {lastName}
          </Text>
        </View>
        <Badge label={role === 'admin' ? 'Admin' : 'Worker'} tone={role === 'admin' ? 'warning' : 'info'} />
      </View>
      <Text style={font.small}>{moment().format('dddd, D MMMM YYYY')}</Text>

      {role === 'admin' && equipo && (
        <>
          <SectionTitle>Today</SectionTitle>
          <View style={styles.stats}>
            <StatTile label="Working now" value={String(trabajando)} icon="pulse" tone="success" />
            <StatTile label="Done today" value={String(terminaron)} icon="checkmark-done" />
            <StatTile
              label="Not in yet"
              value={String(Math.max(equipo.total - trabajando - terminaron, 0))}
              icon="moon-outline"
              tone="warning"
            />
          </View>
        </>
      )}

      {role !== 'admin' && miMes && (
        <>
          <SectionTitle>{moment().format('MMMM')}</SectionTitle>
          <View style={styles.stats}>
            <StatTile label="Hours" value={formatearHoras(miMes.totalHours)} icon="time-outline" />
            <StatTile label="Days worked" value={String(miMes.daysWorked)} icon="calendar-outline" tone="success" />
            <StatTile label="Avg / day" value={formatearHoras(miMes.averageHoursPerDay)} icon="speedometer-outline" tone="warning" />
          </View>
        </>
      )}

      <SectionTitle>My time</SectionTitle>
      <View style={styles.grid}>
        {opcion('Register time', 'Check in or out', 'finger-print', 'TimeRegistration')}
        {opcion('Weekly summary', 'Hours by day', 'calendar', 'WeeklySummary')}
        {opcion('My profile', 'Your information', 'person', 'Profile')}
      </View>

      {role === 'admin' && (
        <>
          <SectionTitle>Administration</SectionTitle>
          <View style={styles.grid}>
            {opcion('Workers', equipo ? `${equipo.total} registered` : 'Review and fix records', 'people', 'SearchWorker')}
            {opcion('Statistics', 'Charts of worked hours', 'bar-chart', 'ViewGraphics')}
          </View>
        </>
      )}

      <Button title="Log out" variant="outline" icon="log-out-outline" onPress={cerrarSesion} style={styles.logout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 720, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexGrow: 1, flexBasis: '45%', minWidth: 150 },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  logout: { marginTop: spacing.lg },
});

export default Home;
