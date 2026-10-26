import { useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  AlertDialog,
  Box,
  Button,
  Center,
  FormControl,
  HStack,
  Input,
  Modal,
  Text,
  VStack,
} from 'native-base';
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
import styles from '../styles/register.styles';

const InitData: RegisterData = {
  firstName: '',
  lastName: '',
  email: '',
  pass: '',
  birthday: '',
};

const validar = (data: RegisterData): Partial<Record<keyof RegisterData, string>> => {
  const errores: Partial<Record<keyof RegisterData, string | null>> = {
    firstName: validarNombre(data.firstName, 'First name'),
    lastName: validarNombre(data.lastName, 'Last name'),
    email: validarEmail(data.email),
    pass: validarClave(data.pass),
    birthday: validarFechaNacimiento(data.birthday),
  };
  return Object.fromEntries(
    Object.entries(errores).filter(([, error]) => error),
  ) as Partial<Record<keyof RegisterData, string>>;
};

const Register = () => {
  const [data, setData] = useState<RegisterData>(InitData);
  const [errores, setErrores] = useState<Partial<Record<keyof RegisterData, string>>>({});
  const [alert, setAlert] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState(moment().year() - 25);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cancelRef = useRef(null);
  const registrado = useRef(false);

  const setValue = (key: keyof RegisterData, value: string) => {
    setData((prevState) => ({ ...prevState, [key]: value }));
    setErrores((prevState) => ({ ...prevState, [key]: undefined }));
  };

  const onClickButton = async () => {
    const encontrados = validar(data);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      return;
    }
    setLoading(true);
    const response = await registerService(data);
    setLoading(false);
    if (response.success) {
      registrado.current = true;
      setMessage('Account created. You can sign in now.');
      setData(InitData);
    } else {
      setMessage(response.message);
    }
    setAlert(true);
  };

  const cerrarAlerta = () => {
    setAlert(false);
    if (registrado.current) {
      navigation.navigate('Login');
    }
  };

  const onDayPress = (day: DateData) => {
    setValue('birthday', day.dateString);
    setShowCalendar(false);
  };

  const campo = (
    clave: keyof RegisterData,
    placeholder: string,
    opciones: Partial<React.ComponentProps<typeof Input>> = {},
  ) => (
    <Center>
      <FormControl isInvalid={Boolean(errores[clave])} maxWidth={320}>
        <Input
          style={styles.input}
          size="l"
          variant="outline"
          placeholder={placeholder}
          value={data[clave]}
          onChangeText={(texto) => setValue(clave, texto)}
          {...opciones}
        />
        <FormControl.ErrorMessage>{errores[clave]}</FormControl.ErrorMessage>
      </FormControl>
    </Center>
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Box style={styles.container}>
        <AlertDialog
          leastDestructiveRef={cancelRef}
          isOpen={alert}
          onClose={cerrarAlerta}
        >
          <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Body>{message}</AlertDialog.Body>
          </AlertDialog.Content>
        </AlertDialog>
        <VStack space={4} alignItems="center">
          <Center>
            <Text style={styles.description}>Please enter your information</Text>
          </Center>
          {campo('firstName', 'First name', { autoComplete: 'given-name' })}
          {campo('lastName', 'Last name', { autoComplete: 'family-name' })}
          {campo('email', 'Email', {
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoCorrect: false,
            autoComplete: 'email',
          })}
          {campo('pass', 'Password (8+ characters, letters and numbers)', {
            type: 'password',
            autoCapitalize: 'none',
            autoComplete: 'new-password',
          })}
          {campo('birthday', `Birthday (${FORMATO_FECHA_NACIMIENTO})`, {
            autoCapitalize: 'none',
            InputRightElement: (
              <Button
                size="xs"
                variant="ghost"
                onPress={() => setShowCalendar(true)}
                accessibilityLabel="Pick birthday from calendar"
              >
                Pick
              </Button>
            ),
          })}
          <Center>
            <Button isLoading={loading} onPress={onClickButton}>
              Create account
            </Button>
          </Center>
          <Center>
            <Text style={styles.login} onPress={() => navigation.navigate('Login')}>
              I already have an account
            </Text>
          </Center>
        </VStack>

        <Modal isOpen={showCalendar} onClose={() => setShowCalendar(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Select your birthday</Modal.Header>
            <Modal.Body>
              <HStack justifyContent="space-between" alignItems="center" mb={2}>
                <Button onPress={() => setSelectedYear((anio) => anio - 1)}>-</Button>
                <Text fontSize="xl">{selectedYear}</Text>
                <Button
                  isDisabled={selectedYear >= moment().year()}
                  onPress={() => setSelectedYear((anio) => anio + 1)}
                >
                  +
                </Button>
              </HStack>
              <Calendar
                key={selectedYear}
                firstDay={1}
                maxDate={moment().format(FORMATO_FECHA_NACIMIENTO)}
                onDayPress={onDayPress}
                current={`${selectedYear}-01-01`}
                monthFormat={'MMMM'}
              />
            </Modal.Body>
          </Modal.Content>
        </Modal>
      </Box>
    </ScrollView>
  );
};

export default Register;
