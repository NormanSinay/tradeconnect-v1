/**
 * @fileoverview ForgotPasswordPageNew component for TradeConnect Frontend
 * @description

Arquitectura recomendada si migras:
  React (componentes interactivos)
    ↓
  Astro (routing y SSR)
    ↓
  shadcn/ui (componentes UI)
    ↓
  Tailwind CSS (estilos)
    ↓
  Radix UI (primitivos accesibles)
    ↓
  React Icons (iconos)

 * @architecture
 * - React: Componentes interactivos con hooks y context
 * - Astro: Routing y Server-Side Rendering (SSR)
 * - shadcn/ui: Componentes UI preconstruidos
 * - Tailwind CSS: Sistema de estilos utilitarios
 * - Radix UI: Primitivos accesibles para componentes
 * - React Icons: Biblioteca de iconos
 *
 * @compatibility SSR: Compatible con Astro SSR
 * @compatibility React: Compatible con React 18+
 * @compatibility TypeScript: Tipos completos incluidos
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  Mail,
  ArrowLeft,
  Send,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

/**
 * ForgotPasswordPageNew - Página de recuperación de contraseña
 * Migrado de MUI a Tailwind CSS + shadcn/ui
 */
const ForgotPasswordPageNew: React.FC = () => {
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
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Error al enviar el correo. Por favor, intenta nuevamente.';
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
            <p className="text-gray-600 text-base">Recupera tu contraseña</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!emailSent ? (
            <>
              {/* Instructions */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Ingresa tu dirección de email y te enviaremos un enlace para
                  restablecer tu contraseña.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      {...register('email')}
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      disabled={isSubmitting}
                      className={`pl-10 ${errors.email ? 'border-error' : ''}`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-error">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full gap-2 py-6 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar Enlace de Recuperación
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success Message */}
              <Alert className="bg-success/10 border-success text-success-foreground">
                <CheckCircle className="h-5 w-5 text-success" />
                <AlertTitle className="ml-2 font-semibold">
                  ¡Correo enviado exitosamente!
                </AlertTitle>
                <AlertDescription className="ml-7 mt-2 space-y-2">
                  <p>
                    Hemos enviado un enlace de recuperación a{' '}
                    <span className="font-semibold">{getValues('email')}</span>
                  </p>
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Revisa tu bandeja de entrada y sigue las instrucciones en el
                  correo para restablecer tu contraseña.
                </p>
                <p className="text-xs text-gray-500">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de
                  spam o solicita un nuevo enlace.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setError(null);
                }}
              >
                Enviar Nuevo Enlace
              </Button>
            </>
          )}

          {/* Back to Login Link */}
          <div className="text-center pt-4">
            <RouterLink
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              <ArrowLeft className="h-3 w-3" />
              Volver al inicio de sesión
            </RouterLink>
          </div>

          {/* Help Text */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda?{' '}
              <a
                href="/contact"
                className="text-primary-600 hover:underline"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPageNew;
