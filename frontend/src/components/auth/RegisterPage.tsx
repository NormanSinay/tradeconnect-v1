/**
 * @fileoverview RegisterPage - Página de registro con stepper multi-paso
 * @description Componente React para registro de usuarios con validación completa
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
 * - Formulario multi-paso con stepper personalizado
 * - Validación completa con Yup y React Hook Form
 * - Indicador de fortaleza de contraseña
 * - Manejo de errores y estados de carga
 * - Compatibilidad SSR con Astro
 * - Diseño responsive con Tailwind CSS
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, CheckCircle } from 'lucide-react';

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
        marketingAccepted: data.newsletter || false, // Mapear newsletter a marketingAccepted
      });
      navigate('/login', {
        state: {
          message: 'Registro exitoso. Verifica tu email para activar tu cuenta.',
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message
        || error.message
        || 'Error al registrarse. Por favor, intenta nuevamente.';
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('firstName')}
                    id="firstName"
                    placeholder="Tu nombre"
                    autoComplete="given-name"
                    className={`pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('lastName')}
                    id="lastName"
                    placeholder="Tu apellido"
                    autoComplete="family-name"
                    className={`pl-10 ${errors.lastName ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
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
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('phone')}
                  id="phone"
                  placeholder="+502 XXXX-XXXX"
                  autoComplete="tel"
                  className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  autoComplete="new-password"
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {watchedValues.password && (
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu contraseña"
                  autoComplete="new-password"
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirma tu registro</h3>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="text-sm">
                  <strong>Nombre:</strong> {watchedValues.firstName} {watchedValues.lastName}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {watchedValues.email}
                </p>
                {watchedValues.phone && (
                  <p className="text-sm">
                    <strong>Teléfono:</strong> {watchedValues.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  {...register('acceptTerms')}
                  disabled={isLoading}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="acceptTerms" className="text-sm font-normal">
                    Acepto los{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">
                      Términos de Servicio
                    </a>{' '}
                    y la{' '}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                      Política de Privacidad
                    </a>
                  </Label>
                  {errors.acceptTerms && (
                    <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="newsletter"
                  {...register('newsletter')}
                  disabled={isLoading}
                />
                <Label htmlFor="newsletter" className="text-sm font-normal">
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            TradeConnect
          </CardTitle>
          <p className="text-muted-foreground">
            Crea tu cuenta
          </p>
        </CardHeader>
        <CardContent>
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((label, index) => (
                <div key={label} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= activeStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-xs mt-2 ${
                    index <= activeStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Alert */}
          {registerError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{registerError}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={activeStep === 0 || isLoading}
                onClick={handleBack}
              >
                Anterior
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && <UserPlus className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
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
          <div className="relative my-8">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">o</span>
            </div>
          </div>

          {/* Google Register */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Continuar con Google
          </Button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <RouterLink to="/login" className="text-primary hover:underline font-medium">
                Inicia sesión aquí
              </RouterLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;