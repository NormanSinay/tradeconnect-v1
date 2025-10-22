import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/authStore'

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { forgotPassword, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError('')
      setSuccess('')
      await forgotPassword(data.email)
      setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el email de recuperación')
    }
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

      <Button
        type="submit"
        className="w-full bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
      </Button>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-[#6B1E22] hover:text-[#8a2b30] transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </motion.form>
  )
}

export default ForgotPasswordForm