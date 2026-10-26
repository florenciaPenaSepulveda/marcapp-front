import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import useUserStore from '../stores/useStore';
import editService, { EditProfileData } from '../services/editprofile.service';
import {
  FORMATO_FECHA_NACIMIENTO,
  validarEmail,
  validarFechaNacimiento,
  validarNombre,
} from '../lib/validation';
import { Button, Card, Dialog, Field, Notice, Screen } from '../components/ui';
import { spacing } from '../theme';

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
  const [errorGeneral, setErrorGeneral] = useState<string>('');
  const [guardado, setGuardado] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const exito = useRef(false);

  const setValue = (key: keyof EditProfileData, value: string) => {
    setData((prevState) => ({ ...prevState, [key]: value }));
    setErrores((prevState) => ({ ...prevState, [key]: undefined }));
  };

  const onEdit = async () => {
    const encontrados = validar(data);
    setErrores(encontrados);
    setErrorGeneral('');
    if (Object.keys(encontrados).length > 0) {
      return;
    }
    setLoading(true);
    const response = await editService(data);
    setLoading(false);
    if (response.success) {
      exito.current = true;
      user.setFirstName(response.data.firstName);
      user.setLastName(response.data.lastName);
      user.setBirthday(response.data.birthday);
      user.setEmail(response.data.email);
      setGuardado(true);
    } else {
      setErrorGeneral(response.message);
    }
  };

  const cerrar = () => {
    setGuardado(false);
    if (exito.current) {
      navigation.goBack();
    }
  };

  return (
    <Screen style={styles.content}>
      <Card style={styles.form}>
        {errorGeneral !== '' && <Notice tone="danger">{errorGeneral}</Notice>}
        <Field
          label="First name"
          value={data.firstName}
          autoCapitalize="words"
          error={errores.firstName}
          onChangeText={(texto) => setValue('firstName', texto)}
        />
        <Field
          label="Last name"
          value={data.lastName}
          autoCapitalize="words"
          error={errores.lastName}
          onChangeText={(texto) => setValue('lastName', texto)}
        />
        <Field
          label="Birthday"
          placeholder={FORMATO_FECHA_NACIMIENTO}
          value={data.birthday}
          autoCapitalize="none"
          hint={`Format ${FORMATO_FECHA_NACIMIENTO}`}
          error={errores.birthday}
          onChangeText={(texto) => setValue('birthday', texto)}
        />
        <Field
          label="Email"
          value={data.email}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errores.email}
          onChangeText={(texto) => setValue('email', texto)}
        />
        <Button title="Save changes" onPress={onEdit} loading={loading} />
        <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
      <Dialog
        visible={guardado}
        tone="success"
        title="Profile updated"
        message="Your changes were saved."
        onClose={cerrar}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  form: { gap: spacing.lg, padding: spacing.xl },
});

export default EditProfile;
