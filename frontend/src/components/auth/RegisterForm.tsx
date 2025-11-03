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
import Turnstile from '@/components/ui/turnstile'

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener mayúsculas, minúsculas y números'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^\+502\s?\d{4}-?\d{4}$/, 'El teléfono debe tener formato guatemalteco (+502 1234-5678)').optional(),
  nit: z.string().regex(/^\d{8}(-[0-9K])?$/i, 'El NIT debe tener formato guatemalteco (12345678 o 12345678-9)').optional(),
  cui: z.string().length(13, 'El CUI debe tener 13 dígitos').regex(/^\d{13}$/, 'El CUI debe contener solo números').optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  marketingAccepted: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const termsAccepted = watch('termsAccepted') || false

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('')
      setSuccess('')

      // Verificar Turnstile
      if (!turnstileToken) {
        setError('Por favor, completa la verificación de seguridad')
        return
      }

      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        nit: data.nit,
        cui: data.cui,
        termsAccepted: data.termsAccepted,
        marketingAccepted: data.marketingAccepted,
        turnstileToken,
      })
      setSuccess('Cuenta creada exitosamente. Te hemos enviado un email de verificación.')
      setTimeout(() => {
        navigate('/verify-email')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
      // Reset Turnstile on error
      setTurnstileToken(null)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // TODO: Implementar autenticación social
    console.log(`Register with ${provider}`)
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

      {success && (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre
        </label>
        <Input
          id="firstName"
          type="text"
          placeholder="Ingresa tu nombre"
          {...register('firstName')}
          className={errors.firstName ? 'border-red-500' : ''}
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
          Apellido
        </label>
        <Input
          id="lastName"
          type="text"
          placeholder="Ingresa tu apellido"
          {...register('lastName')}
          className={errors.lastName ? 'border-red-500' : ''}
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
        )}
      </div>

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
            placeholder="Crea una contraseña segura"
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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="termsAccepted"
          checked={termsAccepted}
          onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
          className="mt-1"
        />
        <label htmlFor="termsAccepted" className="text-sm text-gray-600 leading-relaxed">
          Acepto los{' '}
          <Link to="/terms" className="text-[#6B1E22] hover:text-[#8a2b30] transition-colors underline">
            Términos y Condiciones
          </Link>{' '}
          y la{' '}
          <Link to="/terms" className="text-[#6B1E22] hover:text-[#8a2b30] transition-colors underline">
            Política de Privacidad
          </Link>
        </label>
      </div>
      {errors.termsAccepted && (
        <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
      )}

      <Turnstile
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onVerify={setTurnstileToken}
        onExpired={() => setTurnstileToken(null)}
        onError={() => setTurnstileToken(null)}
        theme="light"
        size="normal"
        className="mb-4"
      />

      <Button
        type="submit"
        className="w-full bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        disabled={isLoading || !turnstileToken}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">O registrarse con</span>
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
          ¿Ya tienes una cuenta?{' '}
          <Link
            to="/login"
            className="text-[#6B1E22] hover:text-[#8a2b30] font-medium transition-colors"
          >
            Inicia sesión aquí
          </Link>
        </span>
      </div>
    </motion.form>
  )
}

export default RegisterForm