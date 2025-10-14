import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { THEME_COLORS, TYPOGRAPHY, BREAKPOINTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils/constants';

// Corporate theme configuration for TradeConnect
const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: THEME_COLORS.primary,
      light: THEME_COLORS.primaryLight,
      dark: THEME_COLORS.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: THEME_COLORS.accent,
      light: '#E6C84A',
      dark: '#B8952A',
      contrastText: '#000000',
    },
    error: {
      main: THEME_COLORS.error,
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: THEME_COLORS.warning,
      light: '#FF9800',
      dark: '#E65100',
    },
    info: {
      main: THEME_COLORS.info,
      light: '#42A5F5',
      dark: '#1565C0',
    },
    success: {
      main: THEME_COLORS.success,
      light: '#4CAF50',
      dark: '#2E7D32',
    },
    background: {
      default: THEME_COLORS.background,
      paper: THEME_COLORS.surface,
    },
    text: {
      primary: THEME_COLORS.textPrimary,
      secondary: THEME_COLORS.textSecondary,
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    h1: {
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize['5xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize['4xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize['3xl'],
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize['2xl'],
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: TYPOGRAPHY.fontSize.base,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      lineHeight: 1.5,
    },
    button: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      textTransform: 'none',
    },
    caption: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  breakpoints: {
    values: BREAKPOINTS,
  },
  spacing: (factor: number) => `${SPACING.xs * factor}px`,
  shape: {
    borderRadius: BORDER_RADIUS.md,
  },
  shadows: [
    'none',
    SHADOWS.sm,
    SHADOWS.md,
    SHADOWS.lg,
    SHADOWS.xl,
    SHADOWS['2xl'],
    SHADOWS.sm,
    SHADOWS.md,
    SHADOWS.lg,
    SHADOWS.xl,
    SHADOWS['2xl'],
    SHADOWS.sm,
    SHADOWS.md,
    SHADOWS.lg,
    SHADOWS.xl,
    SHADOWS['2xl'],
    SHADOWS.sm,
    SHADOWS.md,
    SHADOWS.lg,
    SHADOWS.xl,
    SHADOWS['2xl'],
    SHADOWS.sm,
    SHADOWS.md,
    SHADOWS.lg,
    SHADOWS.xl,
    SHADOWS['2xl'],
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.md,
          padding: `${SPACING.sm}px ${SPACING.lg}px`,
          fontSize: TYPOGRAPHY.fontSize.sm,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: SHADOWS.md,
            transform: 'translateY(-1px)',
          },
          // Mobile responsive
          [BREAKPOINTS.sm]: {
            padding: `${SPACING.xs}px ${SPACING.md}px`,
            fontSize: TYPOGRAPHY.fontSize.xs,
            minHeight: 44, // Touch-friendly size
          },
        },
        contained: {
          '&:hover': {
            boxShadow: SHADOWS.lg,
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        // Size variants for mobile
        sizeSmall: {
          [`@media (max-width: ${BREAKPOINTS.sm}px)`]: {
            padding: `${SPACING.xs}px ${SPACING.sm}px`,
            fontSize: TYPOGRAPHY.fontSize.xs,
            minHeight: 36,
          },
        },
        sizeLarge: {
          [`@media (max-width: ${BREAKPOINTS.sm}px)`]: {
            padding: `${SPACING.md}px ${SPACING.xl}px`,
            fontSize: TYPOGRAPHY.fontSize.base,
            minHeight: 48,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.lg,
          boxShadow: SHADOWS.sm,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: SHADOWS.lg,
            transform: 'translateY(-2px)',
          },
          // Mobile responsive
          [`@media (max-width: ${BREAKPOINTS.md}px)`]: {
            borderRadius: BORDER_RADIUS.md,
            boxShadow: SHADOWS.sm,
            '&:hover': {
              transform: 'none', // Disable hover transform on mobile
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.lg,
        },
        elevation1: {
          boxShadow: SHADOWS.sm,
        },
        elevation2: {
          boxShadow: SHADOWS.md,
        },
        elevation3: {
          boxShadow: SHADOWS.lg,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: BORDER_RADIUS.md,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.sm,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: 'none',
          // Mobile responsive
          [`@media (max-width: ${BREAKPOINTS.md}px)`]: {
            padding: `0 ${SPACING.sm}px`,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: BORDER_RADIUS.lg,
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: THEME_COLORS.primary,
          fontSize: TYPOGRAPHY.fontSize.xs,
          borderRadius: BORDER_RADIUS.sm,
        },
        arrow: {
          color: THEME_COLORS.primary,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: THEME_COLORS.accent,
          color: '#000000',
          fontWeight: TYPOGRAPHY.fontWeight.bold,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: TYPOGRAPHY.fontWeight.medium,
          fontSize: TYPOGRAPHY.fontSize.sm,
          minHeight: 48,
          '&.Mui-selected': {
            color: THEME_COLORS.primary,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: THEME_COLORS.primary,
          height: 3,
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          padding: SPACING.xl,
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-active': {
            color: THEME_COLORS.primary,
          },
          '&.Mui-completed': {
            color: THEME_COLORS.success,
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          '&.Mui-active': {
            color: THEME_COLORS.primary,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
          },
          '&.Mui-completed': {
            color: THEME_COLORS.success,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginTop: SPACING.xs,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: THEME_COLORS.textSecondary,
          '&.Mui-focused': {
            color: THEME_COLORS.primary,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: THEME_COLORS.primary,
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: 'rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 0, 0, 0.12)',
          '&.Mui-checked': {
            color: THEME_COLORS.primary,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 0, 0, 0.12)',
          '&.Mui-checked': {
            color: THEME_COLORS.primary,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: THEME_COLORS.primary,
            '& + .MuiSwitch-track': {
              backgroundColor: THEME_COLORS.primary,
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.full,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        },
        bar: {
          borderRadius: BORDER_RADIUS.full,
          backgroundColor: THEME_COLORS.primary,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: THEME_COLORS.primary,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.md,
        },
        standardSuccess: {
          backgroundColor: 'rgba(56, 142, 60, 0.08)',
          color: THEME_COLORS.success,
        },
        standardError: {
          backgroundColor: 'rgba(211, 47, 47, 0.08)',
          color: THEME_COLORS.error,
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 124, 0, 0.08)',
          color: THEME_COLORS.warning,
        },
        standardInfo: {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          color: THEME_COLORS.info,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: BORDER_RADIUS.md,
          },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

// Custom CSS variables for additional styling
export const cssVariables = {
  '--primary': THEME_COLORS.primary,
  '--primary-light': THEME_COLORS.primaryLight,
  '--primary-dark': THEME_COLORS.primaryDark,
  '--accent': THEME_COLORS.accent,
  '--secondary': THEME_COLORS.secondary,
  '--text-primary': THEME_COLORS.textPrimary,
  '--text-secondary': THEME_COLORS.textSecondary,
  '--error': THEME_COLORS.error,
  '--success': THEME_COLORS.success,
  '--warning': THEME_COLORS.warning,
  '--info': THEME_COLORS.info,
  '--background': THEME_COLORS.background,
  '--surface': THEME_COLORS.surface,
  '--border-radius-sm': `${BORDER_RADIUS.sm}px`,
  '--border-radius-md': `${BORDER_RADIUS.md}px`,
  '--border-radius-lg': `${BORDER_RADIUS.lg}px`,
  '--border-radius-xl': `${BORDER_RADIUS.xl}px`,
  '--shadow-sm': SHADOWS.sm,
  '--shadow-md': SHADOWS.md,
  '--shadow-lg': SHADOWS.lg,
  '--shadow-xl': SHADOWS.xl,
  '--spacing-xs': `${SPACING.xs}px`,
  '--spacing-sm': `${SPACING.sm}px`,
  '--spacing-md': `${SPACING.md}px`,
  '--spacing-lg': `${SPACING.lg}px`,
  '--spacing-xl': `${SPACING.xl}px`,
} as const;