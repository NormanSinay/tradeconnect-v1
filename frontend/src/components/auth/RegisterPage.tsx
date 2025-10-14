import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Google,
  PersonAdd as RegisterIcon,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const registerSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es requerido'),
  lastName: yup
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .required('El apellido es requerido'),
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
  phone: yup
    .string()
    .matches(/^\+502\s\d{4}-\d{4}$/, 'Formato: +502 XXXX-XXXX'),
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
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
    .required('Debes aceptar los términos y condiciones'),
  newsletter: yup.boolean(),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

const steps = ['Información Personal', 'Cuenta', 'Confirmación'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      newsletter: false,
    },
  });

  const watchedValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    switch (activeStep) {
      case 0:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
        break;
      case 1:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      case 2:
        fieldsToValidate = ['acceptTerms'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setRegisterError(null);
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        acceptTerms: data.acceptTerms,
      });
      navigate('/login', {
        state: {
          message: 'Registro exitoso. Verifica tu email para activar tu cuenta.',
        },
      });
    } catch (error) {
      setRegisterError('Error al registrarse. Por favor, intenta nuevamente.');
    }
  };

  const handleGoogleRegister = () => {
    // TODO: Implement Google OAuth
    console.log('Google register clicked');
  };

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

  const passwordStrength = getPasswordStrength(watchedValues.password || '');

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('firstName')}
                fullWidth
                label="Nombre"
                autoComplete="given-name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('lastName')}
                fullWidth
                label="Apellido"
                autoComplete="family-name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('email')}
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('phone')}
                fullWidth
                label="Teléfono (opcional)"
                placeholder="+502 XXXX-XXXX"
                autoComplete="tel"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                {...register('password')}
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
                disabled={isLoading}
              />

              {/* Password Strength Indicator */}
              {watchedValues.password && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fortaleza de la contraseña:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Box
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

            <Grid item xs={12}>
              <TextField
                {...register('confirmPassword')}
                fullWidth
                label="Confirmar Contraseña"
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
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirma tu registro
            </Typography>

            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Nombre:</strong> {watchedValues.firstName} {watchedValues.lastName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {watchedValues.email}
              </Typography>
              {watchedValues.phone && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Teléfono:</strong> {watchedValues.phone}
                </Typography>
              )}
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  {...register('acceptTerms')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label={
                <Typography variant="body2">
                  Acepto los{' '}
                  <Link href="/terms" target="_blank" sx={{ textDecoration: 'none' }}>
                    Términos de Servicio
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacy" target="_blank" sx={{ textDecoration: 'none' }}>
                    Política de Privacidad
                  </Link>
                </Typography>
              }
            />
            {errors.acceptTerms && (
              <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4 }}>
                {errors.acceptTerms.message}
              </Typography>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  {...register('newsletter')}
                  color="primary"
                  disabled={isLoading}
                />
              }
              label="Deseo recibir noticias y actualizaciones por email"
              sx={{ mt: 1 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ py: 8 }}>
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
        <Box sx={{ mb: 3, textAlign: 'center' }}>
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
            Crea tu cuenta
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Alert */}
        {registerError && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {registerError}
          </Alert>
        )}

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: '100%', mt: 1 }}
        >
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || isLoading}
              onClick={handleBack}
              variant="outlined"
            >
              Anterior
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={<RegisterIcon />}
                  sx={{ px: 4 }}
                >
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ width: '100%', my: 3 }}>
          <Divider>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              o
            </Typography>
          </Divider>
        </Box>

        {/* Google Register */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleGoogleRegister}
          disabled={isLoading}
          startIcon={<Google />}
          sx={{
            py: 1.5,
            borderColor: '#dadce0',
            color: '#3c4043',
            '&:hover': {
              borderColor: '#dadce0',
              backgroundColor: '#f8f9fa',
            },
          }}
        >
          Continuar con Google
        </Button>

        {/* Login Link */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes una cuenta?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                textDecoration: 'none',
                fontWeight: 'bold',
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Inicia sesión aquí
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;