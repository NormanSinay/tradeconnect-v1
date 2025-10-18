import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    )
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Token de recuperación no válido o expirado');
      toast.error('Token de recuperación no válido', { duration: 4000 });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema) as any,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchedPassword || '');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de recuperación no válido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await authService.resetPassword(token, data.password);

      if (response.success) {
        setResetSuccess(true);
        toast.success('Contraseña restablecida exitosamente', {
          duration: 4000,
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Tu contraseña ha sido restablecida. Inicia sesión con tu nueva contraseña.',
            },
          });
        }, 2000);
      } else {
        setError(response.message || 'Error al restablecer la contraseña');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message
        || err.message
        || 'Error al restablecer la contraseña. Por favor, intenta nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={8}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        {/* Logo/Brand */}
        <Box component={"div" as any} sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 1,
            }}
          >
            TradeConnect
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Restablecer contraseña
          </Typography>
        </Box>

        {!resetSuccess ? (
          <>
            {/* Instructions */}
            <Box component={"div" as any} sx={{ mb: 3, textAlign: 'center', width: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            {token && (
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ width: '100%' }}
              >
                <Grid container spacing={3}>
                  {/* Password Field */}
                  <Grid item xs={12}>
                    <TextField
                      {...register('password')}
                      fullWidth
                      label="Nueva Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      autoFocus
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />

                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <Box component={"div" as any} sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Fortaleza de la contraseña:
                        </Typography>
                        <Box component={"div" as any} sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <Box
                              component={"div" as any}
                              key={level}
                              sx={{
                                height: 4,
                                flex: 1,
                                borderRadius: 1,
                                backgroundColor:
                                  level <= passwordStrength
                                    ? passwordStrength <= 2
                                      ? 'error.main'
                                      : passwordStrength <= 3
                                      ? 'warning.main'
                                      : 'success.main'
                                    : 'grey.300',
                              }}
                            />
                          ))}
                        </Box>
                        <Typography
                          variant="caption"
                          color={
                            passwordStrength <= 2
                              ? 'error.main'
                              : passwordStrength <= 3
                              ? 'warning.main'
                              : 'success.main'
                          }
                        >
                          {passwordStrength <= 2
                            ? 'Débil'
                            : passwordStrength <= 3
                            ? 'Regular'
                            : passwordStrength <= 4
                            ? 'Buena'
                            : 'Excelente'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* Confirm Password Field */}
                  <Grid item xs={12}>
                    <TextField
                      {...register('confirmPassword')}
                      fullWidth
                      label="Confirmar Nueva Contraseña"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      disabled={isSubmitting}
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isSubmitting || !token}
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                      sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                      {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        ) : (
          <>
            {/* Success Message */}
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>¡Contraseña restablecida exitosamente!</strong>
              </Typography>
              <Typography variant="body2">
                Tu contraseña ha sido actualizada. Serás redirigido al inicio de sesión.
              </Typography>
            </Alert>

            <Box component={"div" as any} sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Redirigiendo...
              </Typography>
            </Box>
          </>
        )}

        {/* Back to Login Link */}
        {!resetSuccess && (
          <Box component={"div" as any} sx={{ mt: 3, textAlign: 'center', width: '100%' }}>
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 18, mr: 0.5 }} />
              Volver al inicio de sesión
            </Link>
          </Box>
        )}

        {/* Help Text */}
        <Box component={"div" as any} sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            ¿Necesitas ayuda? {' '}
            <Link href="/contact" sx={{ textDecoration: 'none' }}>
              Contáctanos
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
