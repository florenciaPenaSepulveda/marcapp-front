import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import loginService from '../services/login.service';
import { validarEmail } from '../lib/validation';
import styles from '../styles/login.styles';

const Login = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [tocado, setTocado] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const errorEmail = tocado ? validarEmail(email) : null;
  const errorClave = tocado && !password ? 'Password is required.' : null;

  const onLogin = async () => {
    setTocado(true);
    if (validarEmail(email) || !password) {
      return;
    }
    setLoading(true);
    setErrorMessage('');
    const response = await loginService({ email, password });
    setLoading(false);
    if (response.success) {
      setPassword('');
      navigation.replace('Home');
    } else {
      setErrorMessage(response.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.marcapp}>MarcApp</Text>
        <Input
          label="Email"
          placeholder="mail@example.cl"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          errorMessage={errorEmail ?? undefined}
          onChangeText={setEmail}
        />
        <Input
          secureTextEntry
          label="Password"
          placeholder="********"
          value={password}
          autoCapitalize="none"
          autoComplete="current-password"
          errorMessage={errorClave ?? undefined}
          onChangeText={setPassword}
          onSubmitEditing={onLogin}
        />
        {errorMessage !== '' && (
          <Text style={styles.error} accessibilityRole="alert">
            {errorMessage}
          </Text>
        )}
        <Button title="Login" onPress={onLogin} loading={loading} />
        <View style={styles.login}>
          <Text
            onPress={() => navigation.navigate('Register')}
            style={styles.signup}
          >
            Sign Up
          </Text>
        </View>
        <Text style={styles.copyright}>
          © 2024 Palta con Pan. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
