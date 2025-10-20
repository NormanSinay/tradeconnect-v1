/**
 * @fileoverview Forgot Password Page component for TradeConnect Frontend
 * @description

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
import { authService } from '@/services/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            TradeConnect
          </CardTitle>
          <p className="text-muted-foreground">
            Recupera tu contraseña
          </p>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <>
              {/* Instructions */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Ingresa tu dirección de email y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...register('email')}
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      autoFocus
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success Message */}
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>¡Correo enviado exitosamente!</strong>
                  <br />
                  Hemos enviado un enlace de recuperación a <strong>{getValues('email')}</strong>
                </AlertDescription>
              </Alert>

              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Revisa tu bandeja de entrada y sigue las instrucciones en el correo para restablecer tu contraseña.
                </p>
                <p className="text-xs text-muted-foreground">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo enlace.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full mb-4"
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
          <div className="text-center mt-6">
            <RouterLink
              to="/login"
              className="inline-flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </RouterLink>
          </div>

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

export default ForgotPasswordPage;
