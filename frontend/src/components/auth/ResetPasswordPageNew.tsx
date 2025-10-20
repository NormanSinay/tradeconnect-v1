/**
 * @fileoverview ResetPasswordPageNew - Página de restablecimiento de contraseña con diseño moderno
 * @description Componente React para restablecer contraseña con validación completa y UI moderna
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
 * - Indicador visual de fortaleza de contraseña
 * - Manejo de tokens de recuperación
 * - Compatibilidad SSR con Astro
 * - Diseño moderno con gradientes y animaciones
 * - Estados de carga y éxito mejorados
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Briefcase } from 'lucide-react';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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

/**
 * ResetPasswordPageNew - Página de restablecimiento de contraseña con diseño moderno
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
const ResetPasswordPageNew: React.FC = () => {
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

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 2) return { label: 'Débil', color: 'bg-error' };
    if (strength <= 3) return { label: 'Regular', color: 'bg-warning' };
    if (strength <= 4) return { label: 'Buena', color: 'bg-blue-500' };
    return { label: 'Excelente', color: 'bg-success' };
  };

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
              message:
                'Tu contraseña ha sido restablecida. Inicia sesión con tu nueva contraseña.',
            },
          });
        }, 2000);
      } else {
        setError(response.message || 'Error al restablecer la contraseña');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Error al restablecer la contraseña. Por favor, intenta nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-2 text-primary-600 mb-2">
              <Briefcase className="text-4xl" />
              <h1 className="text-3xl font-bold">TradeConnect</h1>
            </div>
            <p className="text-gray-600 text-base">Restablecer contraseña</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!resetSuccess ? (
            <>
              {/* Instructions */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Ingresa tu nueva contraseña. Asegúrate de que sea segura y
                  fácil de recordar.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              {token && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        autoFocus
                        disabled={isSubmitting}
                        className={`pl-10 pr-10 ${
                          errors.password ? 'border-error' : ''
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-error">
                        {errors.password.message}
                      </p>
                    )}

                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">
                          Fortaleza de la contraseña:
                        </p>
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const strengthInfo =
                              getPasswordStrengthLabel(passwordStrength);
                            return (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full ${
                                  level <= passwordStrength
                                    ? strengthInfo.color
                                    : 'bg-gray-200'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <p
                          className={`text-xs ${
                            passwordStrength <= 2
                              ? 'text-error'
                              : passwordStrength <= 3
                              ? 'text-warning'
                              : passwordStrength <= 4
                              ? 'text-blue-600'
                              : 'text-success'
                          }`}
                        >
                          {getPasswordStrengthLabel(passwordStrength).label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        {...register('confirmPassword')}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className={`pl-10 pr-10 ${
                          errors.confirmPassword ? 'border-error' : ''
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-error">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full gap-2 py-6 text-base"
                    disabled={isSubmitting || !token}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Restableciendo...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Restablecer Contraseña
                      </>
                    )}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Success Message */}
              <Alert className="bg-success/10 border-success text-success-foreground">
                <CheckCircle className="h-5 w-5 text-success" />
                <AlertTitle className="ml-2 font-semibold">
                  ¡Contraseña restablecida exitosamente!
                </AlertTitle>
                <AlertDescription className="ml-7 mt-2">
                  Tu contraseña ha sido actualizada. Serás redirigido al inicio
                  de sesión.
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                </div>
                <p className="text-sm text-gray-600">Redirigiendo...</p>
              </div>
            </>
          )}

          {/* Back to Login Link */}
          {!resetSuccess && (
            <div className="text-center pt-4">
              <RouterLink
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                Volver al inicio de sesión
              </RouterLink>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda?{' '}
              <a href="/contact" className="text-primary-600 hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPageNew;
