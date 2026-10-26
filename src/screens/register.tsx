import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, DateData } from 'react-native-calendars';
import moment from 'moment';
import { RootStackParamList } from '../../Router';
import registerService, { RegisterData } from '../services/register.service';
import {
  FORMATO_FECHA_NACIMIENTO,
  validarClave,
  validarEmail,
  validarFechaNacimiento,
  validarNombre,
} from '../lib/validation';
import { Button, Card, Dialog, Field, Notice, Screen } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

type Errores = Partial<Record<keyof RegisterData, string>>;

const InitData: RegisterData = {
  firstName: '',
  lastName: '',
  email: '',
  pass: '',
  birthday: '',
};

const validar = (data: RegisterData): Errores =>
  Object.fromEntries(
    Object.entries({
      firstName: validarNombre(data.firstName, 'First name'),
      lastName: validarNombre(data.lastName, 'Last name'),
      email: validarEmail(data.email),
      pass: validarClave(data.pass),
      birthday: validarFechaNacimiento(data.birthday),
    }).filter(([, error]) => error),
  ) as Errores;

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

const Register = () => {
  const [data, setData] = useState<RegisterData>(InitData);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string>('');
  const [creada, setCreada] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState(moment().year() - 25);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const registrado = useRef(false);

  const setValue = (key: keyof RegisterData, value: string) => {
    setData((prevState) => ({ ...prevState, [key]: value }));
    setErrores((prevState) => ({ ...prevState, [key]: undefined }));
  };

  const onClickButton = async () => {
    const encontrados = validar(data);
    setErrores(encontrados);
    setErrorGeneral('');
    if (Object.keys(encontrados).length > 0) {
      return;
    }
    setLoading(true);
    const response = await registerService(data);
    setLoading(false);
    if (response.success) {
      registrado.current = true;
      setCreada(true);
      setData(InitData);
    } else {
      setErrorGeneral(response.message);
    }
  };

  const cerrarAlerta = () => {
    setCreada(false);
    if (registrado.current) {
      navigation.navigate('Login');
    }
  };

  const onDayPress = (day: DateData) => {
    setValue('birthday', day.dateString);
    setShowCalendar(false);
  };

  const clave = data.pass;

  return (
    <Screen style={styles.content}>
      <Card style={styles.form}>
        <Text style={font.small}>Create your account to start tracking your hours.</Text>
        {errorGeneral !== '' && <Notice tone="danger">{errorGeneral}</Notice>}
        <Field
          label="First name"
          placeholder="Ana"
          value={data.firstName}
          autoComplete="given-name"
          error={errores.firstName}
          onChangeText={(texto) => setValue('firstName', texto)}
        />
        <Field
          label="Last name"
          placeholder="Pérez"
          value={data.lastName}
          autoComplete="family-name"
          error={errores.lastName}
          onChangeText={(texto) => setValue('lastName', texto)}
        />
        <Field
          label="Email"
          placeholder="mail@example.cl"
          value={data.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          error={errores.email}
          onChangeText={(texto) => setValue('email', texto)}
        />
        <View>
          <Field
            label="Password"
            placeholder="Create a password"
            value={data.pass}
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            error={errores.pass}
            onChangeText={(texto) => setValue('pass', texto)}
          />
          <View style={styles.requisitos}>
            <Requisito cumplido={clave.length >= 8 && clave.length <= 72} texto="8 to 72 characters" />
            <Requisito cumplido={/\p{L}/u.test(clave)} texto="At least one letter" />
            <Requisito cumplido={/\d/.test(clave)} texto="At least one number" />
          </View>
        </View>
        <Field
          label="Birthday"
          placeholder={FORMATO_FECHA_NACIMIENTO}
          value={data.birthday}
          autoCapitalize="none"
          error={errores.birthday}
          onChangeText={(texto) => setValue('birthday', texto)}
          right={
            <Pressable
              onPress={() => setShowCalendar(true)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Pick birthday from calendar"
            >
              <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            </Pressable>
          }
        />
        <Button title="Create account" onPress={onClickButton} loading={loading} />
        <Button
          title="I already have an account"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
        />
      </Card>

      <Dialog
        visible={creada}
        tone="success"
        title="Account created"
        message="You can sign in now."
        onClose={cerrarAlerta}
      />

      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.overlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={font.heading}>Select your birthday</Text>
              <Pressable onPress={() => setShowCalendar(false)} hitSlop={12} accessibilityLabel="Close" accessibilityRole="button">
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>
            <View style={styles.yearRow}>
              <Button title="−" variant="secondary" onPress={() => setSelectedYear((anio) => anio - 1)} style={styles.yearButton} />
              <Text style={font.heading}>{selectedYear}</Text>
              <Button
                title="+"
                variant="secondary"
                disabled={selectedYear >= moment().year()}
                onPress={() => setSelectedYear((anio) => anio + 1)}
                style={styles.yearButton}
              />
            </View>
            <Calendar
              key={selectedYear}
              firstDay={1}
              maxDate={moment().format(FORMATO_FECHA_NACIMIENTO)}
              onDayPress={onDayPress}
              current={`${selectedYear}-01-01`}
              monthFormat={'MMMM'}
              theme={{ todayTextColor: colors.primary, selectedDayBackgroundColor: colors.primary, arrowColor: colors.primary }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  form: { gap: spacing.lg, padding: spacing.xl },
  requisitos: { gap: 4, marginTop: spacing.sm },
  requisito: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  yearButton: { minHeight: 40, paddingHorizontal: spacing.lg },
});

export default Register;
