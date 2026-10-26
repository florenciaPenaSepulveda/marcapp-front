export const colors = {
  primary: '#1D6FF2',
  primaryDark: '#1558C0',
  primarySoft: '#E7F0FF',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  text: '#1B2430',
  muted: '#6B7788',
  border: '#E2E7F0',
  success: '#1F9D55',
  successSoft: '#E3F6EA',
  danger: '#D64545',
  dangerSoft: '#FCE8E8',
  warning: '#B7791F',
  warningSoft: '#FFF4DB',
  overlay: 'rgba(15, 23, 42, 0.55)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 18, pill: 999 };

export const font = {
  title: { fontSize: 26, fontWeight: '800' as const, color: colors.text },
  heading: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.muted },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.muted },
};

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
