import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import editTimeRegistrationService from '../services/editTimeRegistration.service';
import { deleteTimeRegistrationService } from '../services/searchWorker.service';
import { validarFechaHora } from '../lib/validation';
import { Badge, Button, Card, ConfirmDialog, Dialog, Field, Notice, Screen } from '../components/ui';
import { colors, font, spacing } from '../theme';

const EditTimeRegistration = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { id, date, type } = route.params as {
    id: string;
    date: string;
    type: string;
  };

  const [fecha, setFecha] = useState<string>(date);
  const [error, setError] = useState<string>('');
  const [guardado, setGuardado] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const exito = useRef(false);
  const [confirmando, setConfirmando] = useState<boolean>(false);
  const [eliminando, setEliminando] = useState<boolean>(false);

  const onEdit = async () => {
    const invalida = validarFechaHora(fecha);
    if (invalida) {
      setError(invalida);
      return;
    }
    setError('');
    setLoading(true);
    const response = await editTimeRegistrationService(Number(id), fecha);
    setLoading(false);
    if (response.success) {
      exito.current = true;
      setGuardado(true);
    } else {
      setError(response.message);
    }
  };

  const onDelete = async () => {
    setEliminando(true);
    const response = await deleteTimeRegistrationService(Number(id));
    setEliminando(false);
    setConfirmando(false);
    if (response.success) {
      navigation.goBack();
    } else {
      setError(response.message);
    }
  };

  const cerrar = () => {
    setGuardado(false);
    if (exito.current) {
      navigation.goBack();
    }
  };

  const esEntrada = type === 'entry';

  return (
    <Screen style={styles.content}>
      <Card style={styles.current}>
        <Ionicons
          name={esEntrada ? 'log-in-outline' : 'log-out-outline'}
          size={30}
          color={esEntrada ? colors.success : colors.danger}
        />
        <View style={styles.flex}>
          <Text style={font.small}>Current {esEntrada ? 'check-in' : 'check-out'}</Text>
          <Text style={font.heading}>{date}</Text>
        </View>
        <Badge label={esEntrada ? 'Entry' : 'Exit'} tone={esEntrada ? 'success' : 'danger'} />
      </Card>

      <Card style={styles.form}>
        {error !== '' && <Notice tone="danger">{error}</Notice>}
        <Field
          label="New date and time"
          placeholder="DD-MM-YYYY HH:mm:ss"
          value={fecha}
          autoCapitalize="none"
          hint="The record must stay on the same day, and exit must be after entry."
          onChangeText={(texto) => {
            setFecha(texto);
            setError('');
          }}
        />
        <Button title="Save changes" onPress={onEdit} loading={loading} />
        <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
      <Button
        title="Delete registration"
        variant="outline"
        icon="trash-outline"
        onPress={() => setConfirmando(true)}
      />
      <ConfirmDialog
        visible={confirmando}
        title="Delete this registration?"
        message="This cannot be undone. The worker's hours for the day will be recalculated."
        confirmLabel="Delete"
        loading={eliminando}
        onConfirm={onDelete}
        onCancel={() => setConfirmando(false)}
      />

      <Dialog
        visible={guardado}
        tone="success"
        title="Registration updated"
        message="The time registration was saved."
        onClose={cerrar}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  current: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  form: { gap: spacing.lg, padding: spacing.xl },
});

export default EditTimeRegistration;
