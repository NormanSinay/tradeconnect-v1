import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/authStore'
import ReCAPTCHAComponent from '@/components/ui/recaptcha'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('')

      // Verificar reCAPTCHA
      if (!recaptchaToken) {
        setError('Por favor, completa la verificación reCAPTCHA')
        return
      }

      await login(data.email, data.password, recaptchaToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      // Reset reCAPTCHA on error
      setRecaptchaToken(null)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // TODO: Implementar autenticación social
    console.log(`Login with ${provider}`)
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingresa tu contraseña"
            {...register('password')}
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
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
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600">
            Recordar mi sesión
          </label>
        </div>
        <Link
          to="/forgot-password"
          className="text-sm text-[#6B1E22] hover:text-[#8a2b30] transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <ReCAPTCHAComponent
        siteKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onVerify={setRecaptchaToken}
        onExpired={() => setRecaptchaToken(null)}
        onError={() => setRecaptchaToken(null)}
        action="login"
        className="mb-4"
      />

      <Button
        type="submit"
        className="w-full bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        disabled={isLoading || !recaptchaToken}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">O continuar con</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          className="flex items-center justify-center space-x-2"
        >
          <FaGoogle className="h-4 w-4" />
          <span>Google</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('facebook')}
          className="flex items-center justify-center space-x-2"
        >
          <FaFacebook className="h-4 w-4" />
          <span>Facebook</span>
        </Button>
      </div>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="text-[#6B1E22] hover:text-[#8a2b30] font-medium transition-colors"
          >
            Regístrate aquí
          </Link>
        </span>
      </div>
    </motion.form>
  )
}

export default LoginForm