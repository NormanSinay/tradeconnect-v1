import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { FaQrcode, FaKey, FaCheckCircle, FaCopy, FaShieldAlt } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'react-hot-toast'

// Validation schema
const twoFactorSchema = z.object({
  code: z
    .string()
    .min(6, 'El código debe tener 6 dígitos')
    .max(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números'),
})

type TwoFactorFormData = z.infer<typeof twoFactorSchema>

export const TwoFactorSetupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [secretKey, setSecretKey] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const navigate = useNavigate()

  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  })

  useEffect(() => {
    // Generate QR code and secret on component mount
    const generate2FA = async () => {
      try {
        // In a real app, you would call your API to generate 2FA setup
        // const response = await api.post('/auth/generate-2fa')

        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 1000))

        setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/TradeConnect:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TradeConnect')
        setSecretKey('JBSWY3DPEHPK3PXP')
        setBackupCodes([
          '12345678', '87654321', '11223344', '44332211',
          '55667788', '88776655', '99887766', '66778899'
        ])
      } catch (error) {
        console.error('2FA setup error:', error)
        toast.error('Error al configurar la autenticación de dos factores')
      }
    }

    generate2FA()
  }, [])

  const onSubmit = async (data: TwoFactorFormData) => {
    try {
      setIsLoading(true)

      // In a real app, you would verify the code and enable 2FA
      // const response = await api.post('/auth/verify-2fa-setup', {
      //   code: data.code,
      //   secret: secretKey
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setIsSuccess(true)
      toast.success('¡Autenticación de dos factores activada exitosamente!')
    } catch (error) {
      console.error('2FA verification error:', error)
      toast.error('Código inválido. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tradeconnect-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Códigos de respaldo descargados')
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              ¡2FA Activado!
            </CardTitle>
            <CardDescription>
              La autenticación de dos factores ha sido configurada exitosamente en tu cuenta.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <FaShieldAlt className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">
                    Códigos de Respaldo
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu aplicación de autenticación.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={downloadBackupCodes}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Descargar Códigos de Respaldo
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/profile')}
                className="w-full"
              >
                Ir a Mi Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Configurar Autenticación de Dos Factores
          </CardTitle>
          <CardDescription className="text-center">
            Agrega una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: QR Code */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Paso 1: Escanea el código QR</h3>
            <p className="text-sm text-gray-600 mb-4">
              Usa una aplicación de autenticación como Google Authenticator, Authy o Microsoft Authenticator
            </p>

            {qrCodeUrl ? (
              <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <img
                  src={qrCodeUrl}
                  alt="QR Code para 2FA"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <FaQrcode className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Step 2: Manual Entry */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Paso 2: Código manual (opcional)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Si no puedes escanear el código QR, ingresa esta clave manualmente:
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2 bg-gray-100 rounded font-mono text-sm">
                {secretKey || 'Cargando...'}
              </code>
              <Button
                onClick={() => copyToClipboard(secretKey)}
                variant="outline"
                size="sm"
              >
                <FaCopy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Step 3: Verify Code */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Paso 3: Verifica tu configuración</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ingresa el código de 6 dígitos generado por tu aplicación
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Verificación</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          {...field}
                          disabled={isLoading}
                          className="text-center text-lg tracking-widest"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Activar 2FA'}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>

        <CardFooter className="text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>¿No quieres configurar 2FA ahora?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => navigate('/profile')}
              >
                Saltar por ahora
              </Button>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}