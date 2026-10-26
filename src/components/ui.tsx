import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colorDeAvatar, inicial } from '../lib/avatar';
import { colors, font, radius, shadow, spacing } from '../theme';

const sinContornoWeb = (Platform.OS === 'web' ? { outlineStyle: 'none' } : null) as TextStyle | null;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const Screen = ({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) => {
  const contenido = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.screenContent, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screenContent, styles.flex, style]}>{children}</View>
  );
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {contenido}
    </KeyboardAvoidingView>
  );
};

export const Card = ({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) =>
  onPress ? (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );

type Variante = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  variant?: Variante;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) => {
  const estilo = botones[variant];
  const inactivo = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactivo, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        estilo.container,
        inactivo && styles.buttonDisabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={estilo.text.color} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={estilo.text.color} />}
          <Text style={[styles.buttonText, estilo.text]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};

export const Field = ({
  label,
  error,
  hint,
  secure = false,
  right,
  ...props
}: TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  secure?: boolean;
  right?: React.ReactNode;
}) => {
  const [oculto, setOculto] = useState(secure);
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={font.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          enfocado && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          {...props}
          style={[styles.input, sinContornoWeb]}
          secureTextEntry={oculto}
          placeholderTextColor="#9AA5B5"
          accessibilityLabel={label}
          onFocus={(e) => {
            setEnfocado(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            props.onBlur?.(e);
          }}
        />
        {secure && (
          <Pressable
            onPress={() => setOculto((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={oculto ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        )}
        {right}
      </View>
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={font.small}>{hint}</Text>
      ) : null}
    </View>
  );
};

export const Avatar = ({ name, size = 48 }: { name: string; size?: number }) => (
  <View
    style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: colorDeAvatar(name) },
    ]}
  >
    <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>{inicial(name)}</Text>
  </View>
);

type Tono = 'info' | 'success' | 'danger' | 'warning';

const tonos: Record<Tono, { fondo: string; texto: string; icono: IconName }> = {
  info: { fondo: colors.primarySoft, texto: colors.primaryDark, icono: 'information-circle' },
  success: { fondo: colors.successSoft, texto: colors.success, icono: 'checkmark-circle' },
  danger: { fondo: colors.dangerSoft, texto: colors.danger, icono: 'alert-circle' },
  warning: { fondo: colors.warningSoft, texto: colors.warning, icono: 'warning' },
};

export const Notice = ({ tone = 'info', children }: { tone?: Tono; children: React.ReactNode }) => (
  <View
    style={[styles.notice, { backgroundColor: tonos[tone].fondo }]}
    accessibilityRole={tone === 'danger' ? 'alert' : undefined}
  >
    <Ionicons name={tonos[tone].icono} size={20} color={tonos[tone].texto} />
    <Text style={[styles.noticeText, { color: tonos[tone].texto }]}>{children}</Text>
  </View>
);

export const Badge = ({ label, tone = 'info' }: { label: string; tone?: Tono }) => (
  <View style={[styles.badge, { backgroundColor: tonos[tone].fondo }]}>
    <Text style={[styles.badgeText, { color: tonos[tone].texto }]}>{label}</Text>
  </View>
);

export const EmptyState = ({ icon, title, message }: { icon: IconName; title: string; message?: string }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name={icon} size={30} color={colors.primary} />
    </View>
    <Text style={font.heading}>{title}</Text>
    {message ? <Text style={[font.small, styles.center]}>{message}</Text> : null}
  </View>
);

export const Dialog = ({
  visible,
  title,
  message,
  onClose,
  tone = 'info',
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  tone?: Tono;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.dialog} accessibilityViewIsModal>
        <Ionicons name={tonos[tone].icono} size={34} color={tonos[tone].texto} />
        <Text style={[font.heading, styles.center]}>{title}</Text>
        <Text style={[font.body, styles.center]}>{message}</Text>
        <Button title="OK" onPress={onClose} style={styles.fullWidth} />
      </View>
    </View>
  </Modal>
);

export const Sheet = ({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={[font.heading, styles.flex]} numberOfLines={2}>
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

export const BarChart = ({
  data,
  labels,
  unit = 'h',
}: {
  data: number[];
  labels: string[];
  unit?: string;
}) => {
  const maximo = Math.max(...data, 1);
  return (
    <View style={styles.chart} accessibilityLabel="Bar chart of worked hours">
      {data.map((valor, indice) => (
        <View key={labels[indice]} style={styles.chartColumn}>
          <Text style={styles.chartValue}>{valor > 0 ? `${Math.round(valor * 10) / 10}${unit}` : ''}</Text>
          <View style={styles.chartTrack}>
            <View
              style={[
                styles.chartBar,
                { height: `${Math.max((valor / maximo) * 100, valor > 0 ? 4 : 0)}%` },
              ]}
            />
          </View>
          <Text style={styles.chartLabel}>{labels[indice]}</Text>
        </View>
      ))}
    </View>
  );
};

const botones: Record<Variante, { container: ViewStyle; text: { color: string } }> = {
  primary: { container: { backgroundColor: colors.primary }, text: { color: '#fff' } },
  secondary: { container: { backgroundColor: colors.primarySoft }, text: { color: colors.primaryDark } },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
    text: { color: colors.text },
  },
  danger: { container: { backgroundColor: colors.danger }, text: { color: '#fff' } },
  success: { container: { backgroundColor: colors.success }, text: { color: '#fff' } },
  ghost: { container: { backgroundColor: 'transparent' }, text: { color: colors.primary } },
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  button: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  field: { gap: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 10 },
  errorText: { color: colors.danger, fontSize: 13 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800' },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  noticeText: { flex: 1, fontSize: 14, fontWeight: '600' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: spacing.md,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sectionTitle: { ...font.heading, marginTop: spacing.sm },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 190, paddingTop: spacing.sm },
  chartColumn: { flex: 1, height: '100%', alignItems: 'center', gap: 4 },
  chartTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', backgroundColor: colors.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  chartValue: { fontSize: 10, color: colors.muted, height: 14 },
  chartLabel: { fontSize: 11, color: colors.muted },
});
