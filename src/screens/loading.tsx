import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../Router';
import healthcheckService from '../services/healthcheck.service';
import profileService from '../services/profile.service';
import { MARCAJE_URL, USERS_URL } from '../config';
import useTokenStore from '../stores/tokenStore';
import { Button } from '../components/ui';
import { colors, font, radius, spacing } from '../theme';

const Loading = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hydrated = useTokenStore((state) => state.hydrated);
  const [errorMessage, setErrorMessage] = useState<string>();

  const iniciar = useCallback(async () => {
    setErrorMessage(undefined);
    const [usuariosListo, marcajeListo] = await Promise.all([
      healthcheckService(USERS_URL),
      healthcheckService(MARCAJE_URL),
    ]);
    if (!usuariosListo || !marcajeListo) {
      setErrorMessage('We could not connect to the server. Check your connection and try again.');
      return;
    }

    if (!useTokenStore.getState().token) {
      navigation.replace('Login');
      return;
    }
    const perfil = await profileService();
    if (perfil.success) {
      navigation.replace('Home');
    } else if (!useTokenStore.getState().token) {
      navigation.replace('Login');
    } else {
      setErrorMessage(perfil.message);
    }
  }, [navigation]);

  useEffect(() => {
    if (hydrated) {
      iniciar();
    }
  }, [hydrated, iniciar]);

  return (
    <View style={styles.screen}>
      <View style={styles.logo}>
        <Ionicons name="time" size={44} color="#fff" />
      </View>
      <Text style={styles.brand}>MarcApp</Text>
      {errorMessage ? (
        <View style={styles.error}>
          <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
          <Text style={[font.body, styles.center]}>{errorMessage}</Text>
          <Button title="Try again" onPress={iniciar} icon="refresh" />
        </View>
      ) : (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading" />
          <Text style={font.small}>Starting…</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { ...font.title },
  loader: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  error: { alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, maxWidth: 320 },
  center: { textAlign: 'center' },
});

export default Loading;
