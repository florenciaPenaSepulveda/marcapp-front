import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Router';
import loginService from '../services/login.service';
import { validarEmail } from '../lib/validation';
import { Button, Card, Field, Notice, Screen } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

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
    <Screen style={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="time" size={40} color="#fff" />
        </View>
        <Text style={font.title}>MarcApp</Text>
        <Text style={[font.small, styles.center]}>
          Track your work hours, anywhere.
        </Text>
      </View>

      <Card style={styles.form}>
        <Text style={font.heading}>Welcome back</Text>
        {errorMessage !== '' && <Notice tone="danger">{errorMessage}</Notice>}
        <Field
          label="Email"
          placeholder="mail@example.cl"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={errorEmail}
          onChangeText={setEmail}
        />
        <Field
          label="Password"
          placeholder="Your password"
          value={password}
          secure
          autoCapitalize="none"
          autoComplete="current-password"
          error={errorClave}
          onChangeText={setPassword}
          onSubmitEditing={onLogin}
          returnKeyType="go"
        />
        <Button title="Log in" onPress={onLogin} loading={loading} />
      </Card>

      <View style={styles.signup}>
        <Text style={font.body}>New here?</Text>
        <Button
          title="Create an account"
          variant="ghost"
          onPress={() => navigation.navigate('Register')}
          style={styles.link}
        />
      </View>
      <Text style={[font.small, styles.center]}>
        © 2024 Palta con Pan. All rights reserved.
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', maxWidth: 480, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  logo: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { gap: spacing.lg, padding: spacing.xl },
  signup: { alignItems: 'center' },
  link: { minHeight: 40 },
  center: { textAlign: 'center' },
});

export default Login;
