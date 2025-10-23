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

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
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

  const terms = watch('terms')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('')
      setSuccess('')
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.name.split(' ')[0] || '',
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        termsAccepted: data.terms,
      })
      setSuccess('Cuenta creada exitosamente. Te hemos enviado un email de verificación.')
      setTimeout(() => {
        navigate('/verify-email')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Ingresa tu nombre completo"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
          id="terms"
          checked={terms}
          onCheckedChange={(checked) => setValue('terms', !!checked)}
          className="mt-1"
        />
        <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
          Acepto los{' '}
          <Link to="/terms" className="text-[#6B1E22] hover:text-[#8a2b30] transition-colors">
            Términos y Condiciones
          </Link>{' '}
          y la{' '}
          <Link to="/privacy" className="text-[#6B1E22] hover:text-[#8a2b30] transition-colors">
            Política de Privacidad
          </Link>
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-600">{errors.terms.message}</p>
      )}

      <Button
        type="submit"
        className="w-full bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        disabled={isLoading}
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