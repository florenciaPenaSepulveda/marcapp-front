import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import 'text-encoding-polyfill';
import Joi from 'joi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import loginService from '../services/login.service';
import styles from '../styles/login.styles';


const loginSchema = Joi.object({
  email: Joi.string().min(1).max(30),
  password: Joi.string().min(2).max(30),
});

const Login = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
    setLoading(true);
    const response = await loginService(payload);
    
    if(!response?.success) {
      console.error('Error de autenticación:', response?.message);
      setLoading(false);
    } else {
      setTimeout(() => {
        setLoading(false);
        
        navigation.navigate('Home');
      }, 3000);
    }
    
  };

  return (
    <View
      style={styles.container}
    >
      <Text
        style={styles.marcapp}
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
        style={styles.login}
      >
        <Text
          onPress={() => navigation.navigate('Register')}
          style={styles.signup}
        >
          Sign Up
        </Text>
      </View>
      <View
        style={styles.signuptext}
      >
        <Text style={styles.copyright}>
          © 2024 Palta con Pan. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

export default Login;
