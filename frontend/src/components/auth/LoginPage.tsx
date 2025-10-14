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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  rememberMe: yup.boolean().optional(),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      });
      navigate('/');
    } catch (error) {
      setLoginError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            Inicia sesión en tu cuenta
          </Typography>
        </Box>

        {/* Error Alert */}
        {loginError && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {loginError}
          </Alert>
        )}

        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: '100%' }}
        >
          <Grid container spacing={3}>
            {/* Email Field */}
            <Grid item xs={12}>
              <TextField
                {...register('email')}
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
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

            {/* Password Field */}
            <Grid item xs={12}>
              <TextField
                {...register('password')}
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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
            </Grid>

            {/* Remember Me & Forgot Password */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setValue('rememberMe', e.target.checked)}
                      color="primary"
                      disabled={isLoading}
                    />
                  }
                  label="Recordarme"
                />
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={<LoginIcon />}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Divider */}
        <Box sx={{ width: '100%', my: 3 }}>
          <Divider>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              o
            </Typography>
          </Divider>
        </Box>

        {/* Google Login */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleGoogleLogin}
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

        {/* Register Link */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ¿No tienes una cuenta?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                textDecoration: 'none',
                fontWeight: 'bold',
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Box>

        {/* Terms and Privacy */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" target="_blank" sx={{ textDecoration: 'none' }}>
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" target="_blank" sx={{ textDecoration: 'none' }}>
              Política de Privacidad
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;