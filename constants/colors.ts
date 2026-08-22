export const colors = {
  primary: {
    DEFAULT: '#4F46E5', // Indigo-600
    light: '#818CF8', // Indigo-400
    dark: '#3730A3', // Indigo-800
    subtle: '#EEF2FF', // Indigo-50
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: { DEFAULT: '#059669', light: '#D1FAE5', dark: '#065F46' },
  warning: { DEFAULT: '#D97706', light: '#FEF3C7', dark: '#92400E' },
  danger: { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#991B1B' },
  info: { DEFAULT: '#2563EB', light: '#DBEAFE', dark: '#1E40AF' },
} as const;
