import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { cerrarSesion } from '../session';
import { Avatar, Badge, Button, Card, Screen, SectionTitle } from '../components/ui';
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
            {opcion('Workers', 'Review and fix records', 'people', 'SearchWorker')}
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
