import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/authStore'

const VerifyEmailForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const { verifyEmail } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Obtener token de la URL si existe
  const tokenFromUrl = searchParams.get('token')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else {
      setResendDisabled(false)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Countdown para redirección automática
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (redirectCountdown > 0 && success) {
      timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000)
    } else if (redirectCountdown === 0 && success) {
      navigate('/login')
    }
    return () => clearTimeout(timer)
  }, [redirectCountdown, success, navigate])

  // Auto-verificar si hay token en la URL
  useEffect(() => {
    if (tokenFromUrl) {
      const autoVerify = async () => {
        try {
          setError('')
          setSuccess('')
          await verifyEmail(tokenFromUrl)
          setSuccess('Email verificado exitosamente. Redirigiendo al login...')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Token de verificación inválido')
        }
      }
      autoVerify()
    }
  }, [tokenFromUrl, verifyEmail])

  const handleResendLink = async () => {
    setResendDisabled(true)
    setCountdown(60)
    // TODO: Implementar reenvío de link de verificación
    console.log('Reenviando link de verificación')
  }

  // Si hay token en la URL, mostrar solo el estado de verificación automática
  if (tokenFromUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
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

        {!error && !success && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando tu email...</p>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      {/* Estado de verificación automática con token */}
      {tokenFromUrl && !error && !success && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando tu email...</p>
        </div>
      )}

      {/* Mensaje de éxito con redirección automática */}
      {success && (
        <Alert variant="success">
          <AlertDescription>
            {success} ({redirectCountdown}s)
          </AlertDescription>
        </Alert>
      )}

      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mensaje informativo cuando no hay token */}
      {!tokenFromUrl && !error && !success && (
        <Alert variant="success">
          <AlertDescription>
            Se ha enviado un link de verificación a tu correo electrónico
          </AlertDescription>
        </Alert>
      )}

      {/* Botón de reenviar link (más grande) */}
      <div className="text-center">
        <Button
          onClick={handleResendLink}
          disabled={resendDisabled}
          className={`w-full py-3 text-lg font-medium ${
            resendDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#6B1E22] hover:bg-[#8a2b30] text-white'
          }`}
        >
          {resendDisabled ? `Reenviar link en ${countdown}s` : 'Reenviar link de verificación'}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Haz clic si no recibiste el email o si el link expiró
        </p>
      </div>
    </motion.div>
  )
}

export default VerifyEmailForm