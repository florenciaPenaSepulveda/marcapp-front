import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import Joi from 'joi';
import { useNavigation } from '@react-navigation/native';
import useStore from '../stores/useStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import loginService from '../services/login.service';

const loginSchema = Joi.object({
  email: Joi.string().min(1).max(30),
  password: Joi.string().min(2).max(30),
});

const Login = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setEmail: setEmailStore, setToken: setTokenStore } = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [errorMessageEmail, setErrorMessageEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessagePassword, setErrorMessagePassword] = useState<string>('');

  useEffect(() => {
    //VERIFICA SI LOS CAMPOS DE CONTRASEÑA Y CORREO TIENEN EL FORMATO CORRECTO
    //HAY QUE ARREGLAR EL FORMATO
    const errors = loginSchema.validate({ email, password });

    if (errors?.error?.details[0]?.context?.key === 'email') {
      setErrorMessageEmail(errors?.error?.details[0]?.message);
      //console.log("SetErrorEmail = " + errorMessageEmail);
      return;
    } else if (errors?.error?.details[0]?.context?.key === 'password') {
      setErrorMessagePassword(errors?.error?.details[0]?.message);
      //console.log("SetErrorPassword = " + errorMessagePassword);
      return;
    }

    setErrorMessageEmail('');
    setErrorMessagePassword('');
  }, [email, password]);

  const onLogin = async () => {
    const payload = { email, password };
    console.log('Antes');
    setLoading(true);
    const response = await loginService(payload);
    console.log('Después');
    console.log('Response.data.pass: ' + response.data?.pass);
    console.log('Response JSON: ' + JSON.stringify(response.data?.token));
    
    
    if(!response?.success) {
      console.log("Entró al if --------");
      console.error('Error de autenticación:', response?.message);
      setLoading(false);
    } else {
      setTimeout(() => {
        setLoading(false);
        setEmailStore(email);
        setTokenStore(response.data?.token);
        navigation.navigate('Home');
      }, 3000);
    }
    
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
        label="Email"
        placeholder="mail@example.cl"
        errorMessage={errorMessageEmail}
        onChangeText={(value: string) => setEmail(value)}
      />
      <Input
        secureTextEntry
        label="Password"
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
          Sign Up
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          alignSelf: 'center',
        }}
      >
        <Text style={{ fontSize: 12, color: 'gray' }}>
          © 2024 Palta con Pan. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

export default Login;
