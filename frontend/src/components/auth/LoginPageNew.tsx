import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaBriefcase,
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

/**
 * LoginPageNew - Página de inicio de sesión
 * Migrado de MUI a Tailwind CSS + shadcn/ui
 */
const LoginPageNew: React.FC = () => {
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
    resolver: yupResolver(loginSchema) as any,
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
      const result = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      });

      // Redirect based on user role
      const storedUser = localStorage.getItem('tradeconnect_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const adminRoles = ['super_admin', 'admin', 'manager'];

        // El backend retorna roles como array
        const hasAdminRole = user.roles?.some((role: string) =>
          adminRoles.includes(role)
        );

        if (hasAdminRole) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      setLoginError(
        'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
      );
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-2 text-primary-600 mb-2">
              <FaBriefcase className="text-4xl" />
              <h1 className="text-3xl font-bold">TradeConnect</h1>
            </div>
            <p className="text-gray-600 text-base">Inicia sesión en tu cuenta</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {loginError && (
            <Alert variant="destructive">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                  className={`pl-10 ${errors.email ? 'border-error' : ''}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`pl-10 pr-10 ${errors.password ? 'border-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-error mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setValue('rememberMe', checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Recordarme
                </Label>
              </div>
              <RouterLink
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </RouterLink>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2 py-6 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <FaSignInAlt className="h-5 w-5" />
                  Iniciar Sesión
                </>
              )}
            </Button>
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

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-3 py-6 text-base border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FcGoogle className="h-6 w-6" />
            Continuar con Google
          </Button>

          {/* Register Link */}
          <div className="text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <RouterLink
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Regístrate aquí
            </RouterLink>
          </div>

          {/* Terms and Privacy */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Al iniciar sesión, aceptas nuestros{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Política de Privacidad
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPageNew;
