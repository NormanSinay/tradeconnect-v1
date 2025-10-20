/**
 * @fileoverview ResetPasswordPage - Página de restablecimiento de contraseña
 * @description Componente React para restablecer contraseña con validación completa
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks y state management
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Validación completa con Yup y React Hook Form
 * - Indicador de fortaleza de contraseña
 * - Manejo de tokens de recuperación
 * - Compatibilidad SSR con Astro
 * - Diseño responsive con Tailwind CSS
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            TradeConnect
          </CardTitle>
          <p className="text-muted-foreground">
            Restablecer contraseña
          </p>
        </CardHeader>
        <CardContent>
          {!resetSuccess ? (
            <>
              {/* Instructions */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              {token && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tu nueva contraseña"
                        autoComplete="new-password"
                        autoFocus
                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                        onClick={togglePasswordVisibility}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}

                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Fortaleza de la contraseña:
                        </p>
                        <Progress
                          value={(passwordStrength / 5) * 100}
                          className="h-2 mb-1"
                        />
                        <p className={`text-xs ${
                          passwordStrength <= 2
                            ? 'text-destructive'
                            : passwordStrength <= 3
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {passwordStrength <= 2
                            ? 'Débil'
                            : passwordStrength <= 3
                            ? 'Regular'
                            : passwordStrength <= 4
                            ? 'Buena'
                            : 'Excelente'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...register('confirmPassword')}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirma tu contraseña"
                        autoComplete="new-password"
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                        onClick={toggleConfirmPasswordVisibility}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !token}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Success Message */}
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>¡Contraseña restablecida exitosamente!</strong>
                  <br />
                  Tu contraseña ha sido actualizada. Serás redirigido al inicio de sesión.
                </AlertDescription>
              </Alert>

              <div className="text-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Redirigiendo...
                </p>
              </div>
            </>
          )}

          {/* Back to Login Link */}
          {!resetSuccess && (
            <div className="text-center mt-6">
              <RouterLink
                to="/login"
                className="inline-flex items-center text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </RouterLink>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              ¿Necesitas ayuda?{' '}
              <a href="/contact" className="text-primary hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
