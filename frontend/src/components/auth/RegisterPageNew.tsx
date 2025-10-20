/**
 * @fileoverview RegisterPageNew - Página de registro con stepper avanzado
 * @description Componente React para registro de usuarios con diseño moderno
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
 * - Formulario multi-paso con stepper personalizado avanzado
 * - Validación completa con Yup y React Hook Form
 * - Indicador visual de fortaleza de contraseña
 * - Manejo de errores y estados de carga
 * - Compatibilidad SSR con Astro
 * - Diseño moderno con gradientes y animaciones
 * - Soporte para registro con Google OAuth
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Briefcase, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
    .optional()
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

/**
 * RegisterPageNew - Página de registro con stepper avanzado
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
const RegisterPageNew: React.FC = () => {
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
    resolver: yupResolver(registerSchema) as any,
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
        phone: data.phone,
        acceptTerms: data.acceptTerms,
        marketingAccepted: data.newsletter || false,
      });
      navigate('/login', {
        state: {
          message:
            'Registro exitoso. Verifica tu email para activar tu cuenta.',
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al registrarse. Por favor, intenta nuevamente.';
      setRegisterError(errorMessage);
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

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 2) return { label: 'Débil', color: 'bg-error' };
    if (strength <= 3) return { label: 'Regular', color: 'bg-warning' };
    if (strength <= 4) return { label: 'Buena', color: 'bg-blue-500' };
    return { label: 'Excelente', color: 'bg-success' };
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    {...register('firstName')}
                    id="firstName"
                    autoComplete="given-name"
                    disabled={isLoading}
                    className={`pl-10 ${errors.firstName ? 'border-error' : ''}`}
                    placeholder="Juan"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-error">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    {...register('lastName')}
                    id="lastName"
                    autoComplete="family-name"
                    disabled={isLoading}
                    className={`pl-10 ${errors.lastName ? 'border-error' : ''}`}
                    placeholder="Pérez"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-error">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
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
                  disabled={isLoading}
                  className={`pl-10 ${errors.email ? 'border-error' : ''}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register('phone')}
                  id="phone"
                  autoComplete="tel"
                  disabled={isLoading}
                  className={`pl-10 ${errors.phone ? 'border-error' : ''}`}
                  placeholder="+502 XXXX-XXXX"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-error">{errors.phone.message}</p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`pl-10 pr-10 ${errors.password ? 'border-error' : ''}`}
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
                <p className="text-sm text-error">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {watchedValues.password && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">
                    Fortaleza de la contraseña:
                  </p>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const strengthInfo = getPasswordStrengthLabel(passwordStrength);
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-error' : ''}`}
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirma tu registro
            </h3>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Nombre:</span>{' '}
                  {watchedValues.firstName} {watchedValues.lastName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{' '}
                  {watchedValues.email}
                </p>
                {watchedValues.phone && (
                  <p>
                    <span className="font-semibold">Teléfono:</span>{' '}
                    {watchedValues.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Accept Terms */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptTerms"
                  {...register('acceptTerms')}
                  disabled={isLoading}
                  className="mt-1"
                />
                <Label htmlFor="acceptTerms" className="text-sm font-normal leading-relaxed cursor-pointer">
                  Acepto los{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Términos de Servicio
                  </a>{' '}
                  y la{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Política de Privacidad
                  </a>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-error ml-7">
                  {errors.acceptTerms.message}
                </p>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter"
                  {...register('newsletter')}
                  disabled={isLoading}
                  className="mt-1"
                />
                <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer">
                  Deseo recibir noticias y actualizaciones por email
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 text-primary-600 mb-2">
              <Briefcase className="text-4xl" />
              <h1 className="text-3xl font-bold">TradeConnect</h1>
            </div>
            <p className="text-gray-600 text-base">Crea tu cuenta</p>
          </div>

          {/* Custom Stepper */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((label, index) => (
                <div key={label} className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                        index < activeStep
                          ? 'bg-primary-600 text-white'
                          : index === activeStep
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < activeStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <p
                      className={`mt-2 text-xs font-medium hidden sm:block ${
                        index <= activeStep ? 'text-primary-700' : 'text-gray-500'
                      }`}
                    >
                      {label}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-24 h-1 mx-2 transition-all ${
                        index < activeStep ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {registerError && (
            <Alert variant="destructive">
              <AlertDescription>{registerError}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Content */}
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={activeStep === 0 || isLoading}
              >
                Anterior
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gap-2 px-6"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Crear Cuenta
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Siguiente
                </Button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">o</span>
            </div>
          </div>

          {/* Google Register */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-3 py-6 text-base border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            {/* TODO: Implement Google OAuth icon */}
            Continuar con Google
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <RouterLink
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Inicia sesión aquí
            </RouterLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPageNew;
