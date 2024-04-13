import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import Joi from 'joi';
import { useNavigation } from '@react-navigation/native';
import useStore from '../stores/useStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';

const loginSchema = Joi.object({
  user: Joi.string().min(1).max(10),
  password: Joi.string().min(1).max(10),
});

const Login = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser: setUserStore } = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<string>('');
  const [errorMessageUser, setErrorMessageUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessagePassword, setErrorMessagePassword] = useState<string>('');

  useEffect(() => {
    const errors = loginSchema.validate({ user, password });
    console.log(password);
    console.log(errors?.error?.details[0]?.context?.key);

    // if (errors?.error?.details[0]?.context?.key === 'user') {
    //   setErrorMessageUser(errors?.error?.details[0]?.message);
    //   return;
    // } else if (errors?.error?.details[0]?.context?.key === 'password') {
    //   setErrorMessagePassword(errors?.error?.details[0]?.message);
    //   return;
    // }

    // setErrorMessageUser('');
    // setErrorMessagePassword('');
  }, [user, password]);

  const onLogin = async () => {
    const payload = { user, password };
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUserStore(user);
      navigation.navigate('Home');
    }, 3000);
    // const response = await loginService(payload);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingHorizontal: '10%',
        paddingVertical: '5%',
      }}
    >
      <Text
        style={{
          fontSize: 30,
          textAlign: 'center',
          fontWeight: '700',
          marginVertical: '10%',
        }}
      >
        MarcApp
      </Text>
      <Input
        label="Usuario"
        placeholder="Juanito"
        errorMessage={errorMessageUser}
        onChangeText={(value: string) => setUser(value)}
      />
      <Input
        secureTextEntry
        label="Contraseña"
        placeholder="********"
        errorMessage={errorMessagePassword}
        onChangeText={(value: string) => setPassword(value)}
      />
      <Button title="Login" onPress={onLogin} loading={loading} />
      <View
        style={{
          flexDirection: 'column',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          onPress={() => navigation.navigate('Register')}
          style={{ textAlign: 'center', marginTop: '10%' }}
        >
          Crear cuenta
        </Text>
      </View>
    </View>
  );
};

export default Login;
