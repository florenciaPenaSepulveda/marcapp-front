import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AlertDialog, Box, Button, Center, FormControl, Input, Text, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from 'react-native-elements';
import { RootStackParamList } from '../../Router';
import useUserStore from '../stores/useStore';
import editService, { EditProfileData } from '../services/editprofile.service';
import {
  FORMATO_FECHA_NACIMIENTO,
  validarEmail,
  validarFechaNacimiento,
  validarNombre,
} from '../lib/validation';
import styles from '../styles/editProfile.styles';

type Errores = Partial<Record<keyof EditProfileData, string>>;

const validar = (data: EditProfileData): Errores =>
  Object.fromEntries(
    Object.entries({
      firstName: validarNombre(data.firstName, 'First name'),
      lastName: validarNombre(data.lastName, 'Last name'),
      birthday: validarFechaNacimiento(data.birthday),
      email: validarEmail(data.email),
    }).filter(([, error]) => error),
  ) as Errores;

const EditProfile = () => {
  const user = useUserStore();
  const [data, setData] = useState<EditProfileData>({
    firstName: user.firstName,
    lastName: user.lastName,
    birthday: user.birthday.slice(0, 10),
    email: user.email,
  });
  const [errores, setErrores] = useState<Errores>({});
  const [alert, setAlert] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cancelRef = useRef(null);
  const guardado = useRef(false);

  const setValue = (key: keyof EditProfileData, value: string) => {
    setData((prevState) => ({ ...prevState, [key]: value }));
    setErrores((prevState) => ({ ...prevState, [key]: undefined }));
  };

  const onEdit = async () => {
    const encontrados = validar(data);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      return;
    }
    setLoading(true);
    const response = await editService(data);
    setLoading(false);
    if (response.success) {
      guardado.current = true;
      user.setFirstName(response.data.firstName);
      user.setLastName(response.data.lastName);
      user.setBirthday(response.data.birthday);
      user.setEmail(response.data.email);
      setMessage('Profile updated successfully!');
    } else {
      setMessage(response.message);
    }
    setAlert(true);
  };

  const cerrarAlerta = () => {
    setAlert(false);
    if (guardado.current) {
      navigation.goBack();
    }
  };

  const campo = (clave: keyof EditProfileData, placeholder: string) => (
    <Center>
      <FormControl isInvalid={Boolean(errores[clave])} maxWidth={320}>
        <Input
          style={styles.input}
          size="l"
          variant="outline"
          placeholder={placeholder}
          value={data[clave]}
          autoCapitalize={clave === 'email' || clave === 'birthday' ? 'none' : 'words'}
          keyboardType={clave === 'email' ? 'email-address' : 'default'}
          onChangeText={(texto) => setValue(clave, texto)}
        />
        <FormControl.ErrorMessage>{errores[clave]}</FormControl.ErrorMessage>
      </FormControl>
    </Center>
  );

  return (
    <Box style={styles.container}>
      <Header
        centerComponent={{
          text: 'Edit profile',
          style: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
        }}
        containerStyle={{
          backgroundColor: '#0AA5F2',
          justifyContent: 'space-around',
        }}
      />
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={alert} onClose={cerrarAlerta}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Body>{message}</AlertDialog.Body>
        </AlertDialog.Content>
      </AlertDialog>
      <ScrollView keyboardShouldPersistTaps="handled">
        <VStack space={4} alignItems="center">
          <Center>
            <Text style={styles.description}>Edit your profile data</Text>
          </Center>
          {campo('firstName', 'First name')}
          {campo('lastName', 'Last name')}
          {campo('birthday', `Birthday (${FORMATO_FECHA_NACIMIENTO})`)}
          {campo('email', 'E-mail address (format: user@mail.abc)')}
          <View style={styles.testContainer}>
            <Button isLoading={loading} onPress={onEdit}>
              Save changes
            </Button>
          </View>
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default EditProfile;
