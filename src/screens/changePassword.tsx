import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import changePasswordService from '../services/password.service';
import { validarClave } from '../lib/validation';
import { Button, Card, Dialog, Field, Notice, Screen } from '../components/ui';
import { colors, font, spacing } from '../theme';

type Errores = { current?: string; next?: string; confirm?: string };

const Requisito = ({ cumplido, texto }: { cumplido: boolean; texto: string }) => (
  <View style={styles.requisito}>
    <Ionicons
      name={cumplido ? 'checkmark-circle' : 'ellipse-outline'}
      size={16}
      color={cumplido ? colors.success : colors.muted}
    />
    <Text style={[font.small, cumplido && { color: colors.success }]}>{texto}</Text>
  </View>
);

const ChangePassword = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [loading, setLoading] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const exito = useRef(false);

  const validar = (): Errores => {
    const encontrados: Errores = {};
    if (!actual) {
      encontrados.current = 'Enter your current password.';
    }
    const errorClave = validarClave(nueva);
    if (errorClave) {
      encontrados.next = errorClave;
    } else if (nueva === actual) {
      encontrados.next = 'The new password must be different.';
    }
    if (confirmacion !== nueva) {
      encontrados.confirm = 'Passwords do not match.';
    }
    return encontrados;
  };

  const onSave = async () => {
    const encontrados = validar();
    setErrores(encontrados);
    setErrorGeneral('');
    if (Object.keys(encontrados).length > 0) {
      return;
    }
    setLoading(true);
    const response = await changePasswordService(actual, nueva);
    setLoading(false);
    if (response.success) {
      exito.current = true;
      setGuardada(true);
    } else {
      setErrorGeneral(response.message);
    }
  };

  const cerrar = () => {
    setGuardada(false);
    if (exito.current) {
      navigation.goBack();
    }
  };

  return (
    <Screen style={styles.content}>
      <Card style={styles.form}>
        {errorGeneral !== '' && <Notice tone="danger">{errorGeneral}</Notice>}
        <Field
          label="Current password"
          value={actual}
          secure
          autoCapitalize="none"
          autoComplete="current-password"
          error={errores.current}
          onChangeText={(texto) => {
            setActual(texto);
            setErrores((previo) => ({ ...previo, current: undefined }));
          }}
        />
        <View>
          <Field
            label="New password"
            value={nueva}
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            error={errores.next}
            onChangeText={(texto) => {
              setNueva(texto);
              setErrores((previo) => ({ ...previo, next: undefined }));
            }}
          />
          <View style={styles.requisitos}>
            <Requisito cumplido={nueva.length >= 8 && nueva.length <= 72} texto="8 to 72 characters" />
            <Requisito cumplido={/\p{L}/u.test(nueva)} texto="At least one letter" />
            <Requisito cumplido={/\d/.test(nueva)} texto="At least one number" />
          </View>
        </View>
        <Field
          label="Confirm new password"
          value={confirmacion}
          secure
          autoCapitalize="none"
          error={errores.confirm}
          onChangeText={(texto) => {
            setConfirmacion(texto);
            setErrores((previo) => ({ ...previo, confirm: undefined }));
          }}
          onSubmitEditing={onSave}
        />
        <Button title="Update password" onPress={onSave} loading={loading} />
        <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
      <Dialog
        visible={guardada}
        tone="success"
        title="Password updated"
        message="Use your new password the next time you log in."
        onClose={cerrar}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  form: { gap: spacing.lg, padding: spacing.xl },
  requisitos: { gap: 4, marginTop: spacing.sm },
  requisito: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

export default ChangePassword;
