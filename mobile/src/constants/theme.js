export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  secondary: '#0F172A',
  secondaryLight: '#334155',
  accent: '#22C55E',
  accentDark: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F1F5F9',
  surface: '#FFFFFF',
  muted: '#94A3B8',
  mutedText: '#64748B',
  border: '#E2E8F0',
  cardBorder: '#F1F5F9',
  white: '#FFFFFF',
  black: '#000000',
  tabInactive: '#94A3B8',
  shadow: '#0F172A',
  glassBg: 'rgba(255,255,255,0.7)',
  glassBorder: 'rgba(255,255,255,0.3)',
  overlay: 'rgba(15,23,42,0.5)',
  skeleton: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',
}

export const GRADIENTS = {
  primary: ['#2563EB', '#1D4ED8'],
  accent: ['#22C55E', '#16A34A'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#EF4444', '#DC2626'],
  dark: ['#0F172A', '#1E293B'],
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)'],
}

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32,
}

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
}

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
}
