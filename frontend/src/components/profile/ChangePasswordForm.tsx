import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Save,
  Lock,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { VALIDATION_RULES } from '@/utils/constants';
import { authService } from '@/services/api';
import { toast } from 'react-hot-toast';
import SecureInput from '@/components/common/SecureInput';

// Validation schema
const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Contraseña actual es requerida'),
  newPassword: yup
    .string()
    .required('Nueva contraseña es requerida')
    .min(
      VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres`
    )
    .matches(
      /[A-Z]/,
      'La contraseña debe contener al menos una letra mayúscula'
    )
    .matches(
      /[a-z]/,
      'La contraseña debe contener al menos una letra minúscula'
    )
    .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'La contraseña debe contener al menos un símbolo especial'
    )
    .test(
      'not-same-as-current',
      'La nueva contraseña debe ser diferente a la actual',
      function (value) {
        return value !== this.parent.currentPassword;
      }
    ),
  confirmPassword: yup
    .string()
    .required('Confirmar contraseña es requerido')
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden'),
});

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordForm: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  // Watch new password for strength indicator
  const newPassword = watch('newPassword');

  // Calculate password strength
  React.useEffect(() => {
    if (newPassword) {
      let score = 0;
      const feedback: string[] = [];

      // Length check
      if (newPassword.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        score++;
      } else {
        feedback.push(
          `Al menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres`
        );
      }

      // Uppercase check
      if (/[A-Z]/.test(newPassword)) {
        score++;
      } else {
        feedback.push('Una letra mayúscula');
      }

      // Lowercase check
      if (/[a-z]/.test(newPassword)) {
        score++;
      } else {
        feedback.push('Una letra minúscula');
      }

      // Number check
      if (/[0-9]/.test(newPassword)) {
        score++;
      } else {
        feedback.push('Un número');
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        score++;
      } else {
        feedback.push('Un símbolo especial');
      }

      setPasswordStrength({ score, feedback });
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [newPassword]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSaving(true);
    setShowSuccess(false);

    try {
      const response = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        setShowSuccess(true);
        reset();
        toast.success('Contraseña actualizada exitosamente');
      } else {
        throw new Error(response.message || 'Error al cambiar contraseña');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(
        error.response?.data?.message || 'Error al cambiar la contraseña'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score >= 5) return 'success.main';
    if (score >= 4) return 'info.main';
    if (score >= 3) return 'warning.main';
    return 'error.main';
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score >= 5) return 'Muy Fuerte';
    if (score >= 4) return 'Fuerte';
    if (score >= 3) return 'Buena';
    if (score >= 2) return 'Regular';
    return 'Débil';
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Cambiar Contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Asegúrate de usar una contraseña fuerte y única para proteger tu cuenta.
        </Typography>
      </Box>

      {/* Success Alert */}
      {showSuccess && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          Tu contraseña ha sido actualizada exitosamente. La próxima vez que inicies
          sesión, usa tu nueva contraseña.
        </Alert>
      )}

      {/* Form Fields */}
      <Grid container spacing={3}>
        {/* Current Password */}
        <Grid item xs={12}>
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <SecureInput
                {...field}
                label="Contraseña Actual"
                type="password"
                error={errors.currentPassword?.message}
                helperText="Ingresa tu contraseña actual para confirmar"
                autoComplete="current-password"
              />
            )}
          />
        </Grid>

        {/* New Password */}
        <Grid item xs={12}>
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <SecureInput
                {...field}
                label="Nueva Contraseña"
                type="password"
                error={errors.newPassword?.message}
                autoComplete="new-password"
                showStrengthIndicator
              />
            )}
          />

          {/* Password Strength Indicator */}
          {newPassword && (
            <Box component={"div" as any} sx={{ mt: 2 }}>
              <Box
                component={"div" as any}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Fortaleza de la contraseña:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 'bold',
                    color: getPasswordStrengthColor(passwordStrength.score),
                  }}
                >
                  {getPasswordStrengthLabel(passwordStrength.score)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(passwordStrength.score / 5) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getPasswordStrengthColor(passwordStrength.score),
                    borderRadius: 4,
                  },
                }}
              />

              {/* Password Requirements */}
              {passwordStrength.feedback.length > 0 && (
                <Box component={"div" as any} sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    La contraseña debe incluir:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {passwordStrength.feedback.map((item, index) => (
                      <Box
                        key={index}
                        component="li"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          mb: 0.5,
                        }}
                      >
                        <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />
                        {item}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {passwordStrength.score === 5 && (
                <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
                  ¡Excelente! Tu contraseña es muy fuerte.
                </Alert>
              )}
            </Box>
          )}
        </Grid>

        {/* Confirm Password */}
        <Grid item xs={12}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <SecureInput
                {...field}
                label="Confirmar Nueva Contraseña"
                type="password"
                error={errors.confirmPassword?.message}
                helperText="Ingresa la nueva contraseña nuevamente"
                autoComplete="new-password"
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box component={"div" as any} sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
          disabled={isSaving || !isValid}
          size="large"
        >
          {isSaving ? 'Guardando...' : 'Cambiar Contraseña'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => reset()}
          disabled={isSaving}
          size="large"
        >
          Cancelar
        </Button>
      </Box>

      {/* Security Tips */}
      <Alert severity="info" icon={<Lock />} sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }} gutterBottom>
          Consejos de Seguridad:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>
            <Typography variant="body2">
              Usa una contraseña única que no uses en otros sitios
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Combina letras mayúsculas, minúsculas, números y símbolos
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Evita información personal como nombres o fechas
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Considera usar un gestor de contraseñas
            </Typography>
          </li>
        </Box>
      </Alert>
    </Box>
  );
};

export default ChangePasswordForm;
