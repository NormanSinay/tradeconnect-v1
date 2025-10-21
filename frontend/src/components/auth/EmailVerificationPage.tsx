import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaCheckCircle, FaTimesCircle, FaEnvelope, FaRedo } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

export const EmailVerificationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isResending, setIsResending] = useState(false)
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsVerified(false)
        setIsLoading(false)
        return
      }

      try {
        // In a real app, you would verify the email with your API
        // const response = await api.post('/auth/verify-email', { token })

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Simulate success (in real app, check response)
        setIsVerified(true)
      } catch (error) {
        console.error('Email verification error:', error)
        setIsVerified(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [token])

  const handleResendVerification = async () => {
    try {
      setIsResending(true)

      // In a real app, you would resend verification email
      // const response = await api.post('/auth/resend-verification')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success('Se ha enviado un nuevo email de verificación')
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error('Error al reenviar el email de verificación')
    } finally {
      setIsResending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Verificando tu email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isVerified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaTimesCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Verificación Fallida
            </CardTitle>
            <CardDescription>
              El enlace de verificación es inválido o ha expirado.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Los enlaces de verificación expiran después de 24 horas. Puedes solicitar un nuevo email de verificación.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reenviando...
                  </>
                ) : (
                  <>
                    <FaRedo className="mr-2 h-4 w-4" />
                    Reenviar Email de Verificación
                  </>
                )}
              </Button>

              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Ir al Inicio de Sesión
              </Button>
            </div>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda?{' '}
              <Link to="/contacto" className="text-primary hover:underline">
                Contacta a soporte
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            ¡Email Verificado!
          </CardTitle>
          <CardDescription>
            Tu cuenta ha sido verificada exitosamente. Ya puedes disfrutar de todos los beneficios de TradeConnect.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <FaEnvelope className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Cuenta Activada</span>
            </div>
            <p className="text-sm text-green-700">
              Tu email ha sido confirmado y tu cuenta está ahora completamente activa.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Iniciar Sesión
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Explorar Eventos
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-xs text-gray-500">
            ¿Tienes preguntas?{' '}
            <Link to="/contacto" className="text-primary hover:underline">
              Estamos aquí para ayudarte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}