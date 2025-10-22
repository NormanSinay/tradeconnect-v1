import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/authStore'

const verifyEmailSchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
})

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

const VerifyEmailForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { verifyEmail, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  })

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else {
      setResendDisabled(false)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      setError('')
      setSuccess('')
      await verifyEmail(data.code)
      setSuccess('Email verificado exitosamente. Redirigiendo...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código de verificación inválido')
    }
  }

  const handleResendCode = async () => {
    setResendDisabled(true)
    setCountdown(60)
    // TODO: Implementar reenvío de código
    console.log('Reenviando código de verificación')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      <Alert variant="success">
        <AlertDescription>
          Se ha enviado un código de 6 dígitos a <strong>usuario@ejemplo.com</strong>
        </AlertDescription>
      </Alert>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Código de Verificación
          </label>
          <Input
            id="code"
            type="text"
            placeholder="Ingresa el código de 6 dígitos"
            maxLength={6}
            {...register('code')}
            className={`text-center text-2xl tracking-widest ${errors.code ? 'border-red-500' : ''}`}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Verificando...' : 'Verificar Cuenta'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          ¿No recibiste el código?{' '}
          <button
            onClick={handleResendCode}
            disabled={resendDisabled}
            className={`font-medium transition-colors ${
              resendDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#6B1E22] hover:text-[#8a2b30]'
            }`}
          >
            {resendDisabled ? `Reenviar en ${countdown}s` : 'Reenviar código'}
          </button>
        </p>
      </div>
    </motion.div>
  )
}

export default VerifyEmailForm