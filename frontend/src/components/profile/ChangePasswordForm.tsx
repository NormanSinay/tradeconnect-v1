/**
 * @fileoverview ChangePasswordForm Component - Arquitectura React/Astro + Tailwind CSS + shadcn/ui
 *
 * Arquitectura recomendada para migración:
 * React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui (componentes UI)
 * → Tailwind CSS (estilos) → Radix UI (primitivos accesibles) → Lucide Icons (iconos)
 *
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Formulario de cambio de contraseña con validación avanzada,
 * indicador de fortaleza de contraseña y gestión de estado.
 * Compatible con SSR de Astro y optimizado para performance.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Save,
  Lock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { VALIDATION_RULES } from '@/utils/constants';
import { authService } from '@/services/api';
import { toast } from 'react-hot-toast';
import SecureInput from '@/components/common/SecureInput';
import { cn } from '@/lib/utils';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Cambiar Contraseña</h2>
        <p className="text-sm text-gray-600">
          Asegúrate de usar una contraseña fuerte y única para proteger tu cuenta.
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Tu contraseña ha sido actualizada exitosamente. La próxima vez que inicies
            sesión, usa tu nueva contraseña.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2">
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
        </div>

        {/* New Password */}
        <div className="space-y-2">
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
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Fortaleza de la contraseña:</span>
                <span className={cn(
                  "text-xs font-bold",
                  passwordStrength.score >= 5 ? "text-green-600" :
                  passwordStrength.score >= 4 ? "text-blue-600" :
                  passwordStrength.score >= 3 ? "text-yellow-600" : "text-red-600"
                )}>
                  {passwordStrength.score >= 5 ? "Muy Fuerte" :
                   passwordStrength.score >= 4 ? "Fuerte" :
                   passwordStrength.score >= 3 ? "Buena" :
                   passwordStrength.score >= 2 ? "Regular" : "Débil"}
                </span>
              </div>
              <Progress
                value={(passwordStrength.score / 5) * 100}
                className="h-2"
              />

              {/* Password Requirements */}
              {passwordStrength.feedback.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">La contraseña debe incluir:</p>
                  <ul className="m-0 pl-4 space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index} className="flex items-center gap-1 text-xs text-gray-600">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {passwordStrength.score === 5 && (
                <Alert className="mt-2">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>¡Excelente! Tu contraseña es muy fuerte.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
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
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSaving || !isValid}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSaving}
        >
          Cancelar
        </Button>
      </div>

      {/* Security Tips */}
      <Alert className="mt-6">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong className="block mb-2">Consejos de Seguridad:</strong>
          <ul className="m-0 pl-4 space-y-1 text-sm">
            <li>Usa una contraseña única que no uses en otros sitios</li>
            <li>Combina letras mayúsculas, minúsculas, números y símbolos</li>
            <li>Evita información personal como nombres o fechas</li>
            <li>Considera usar un gestor de contraseñas</li>
          </ul>
        </AlertDescription>
      </Alert>
    </form>
  );
};

export default ChangePasswordForm;
