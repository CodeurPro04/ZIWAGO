export const Colors = {
  primary: '#4A90E2',
  secondary: '#E3F2FD',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  border: '#EEEEEE',
  error: '#FF4444',
  success: '#4CAF50',
  wallet: '#4A90E2',
  light: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#007AFF',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#0A84FF',
  },
};

export const Spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 40,
};

export const Typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
};

export const Fonts = {
  regular: 'Inter-Regular',
  bold: 'Inter-Bold',
  mono: 'SpaceMono-Regular',
};
