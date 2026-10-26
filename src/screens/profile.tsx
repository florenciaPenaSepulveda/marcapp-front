import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import useUserStore from '../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import { Avatar, Badge, Button, Card, Screen } from '../components/ui';
import { colors, font, spacing } from '../theme';

type Icono = React.ComponentProps<typeof Ionicons>['name'];

const Dato = ({ icono, etiqueta, valor }: { icono: Icono; etiqueta: string; valor: string }) => (
  <View style={styles.row}>
    <View style={styles.rowIcon}>
      <Ionicons name={icono} size={20} color={colors.primary} />
    </View>
    <View style={styles.flex}>
      <Text style={font.small}>{etiqueta}</Text>
      <Text style={font.body}>{valor}</Text>
    </View>
  </View>
);

const Profile = () => {
  const firstName = useUserStore((state) => state.firstName);
  const lastName = useUserStore((state) => state.lastName);
  const email = useUserStore((state) => state.email);
  const birthday = useUserStore((state) => state.birthday);
  const role = useUserStore((state) => state.role);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen style={styles.content}>
      <Card style={styles.hero}>
        <Avatar name={firstName} size={92} />
        <Text style={font.title}>
          {firstName} {lastName}
        </Text>
        <Badge label={role === 'admin' ? 'Administrator' : 'Worker'} tone={role === 'admin' ? 'warning' : 'info'} />
      </Card>
      <Card style={styles.details}>
        <Dato icono="mail-outline" etiqueta="Email" valor={email} />
        <Dato
          icono="gift-outline"
          etiqueta="Birthday"
          valor={moment(birthday, 'YYYY-MM-DD').format('D MMMM YYYY')}
        />
      </Card>
      <Button title="Edit profile" icon="create-outline" onPress={() => navigation.navigate('EditProfile')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  hero: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  details: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Profile;
