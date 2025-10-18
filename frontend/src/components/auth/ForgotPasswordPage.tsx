import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema) as any,
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await authService.forgotPassword(data.email);

      if (response.success) {
        setEmailSent(true);
        toast.success('Correo enviado. Revisa tu bandeja de entrada.', {
          duration: 5000,
        });
      } else {
        setError(response.message || 'Error al enviar el correo');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message
        || err.message
        || 'Error al enviar el correo. Por favor, intenta nuevamente.';
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
            Recupera tu contraseña
          </Typography>
        </Box>

        {!emailSent ? (
          <>
            {/* Instructions */}
            <Box component={"div" as any} sx={{ mb: 3, textAlign: 'center', width: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Ingresa tu dirección de email y te enviaremos un enlace para restablecer tu contraseña.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
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
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    sx={{ py: 1.5, fontSize: '1.1rem' }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <>
            {/* Success Message */}
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>¡Correo enviado exitosamente!</strong>
              </Typography>
              <Typography variant="body2">
                Hemos enviado un enlace de recuperación a <strong>{getValues('email')}</strong>
              </Typography>
            </Alert>

            <Box component={"div" as any} sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Revisa tu bandeja de entrada y sigue las instrucciones en el correo para restablecer tu contraseña.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Si no recibes el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo enlace.
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setEmailSent(false);
                setError(null);
              }}
              sx={{ mb: 2 }}
            >
              Enviar Nuevo Enlace
            </Button>
          </>
        )}

        {/* Back to Login Link */}
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

export default ForgotPasswordPage;
