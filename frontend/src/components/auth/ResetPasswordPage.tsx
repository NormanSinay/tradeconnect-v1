import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaCheckCircle, FaLock } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'react-hot-toast'

// Validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Validate token on component mount
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false)
        return
      }

      try {
        // In a real app, you would validate the token with your API
        // const response = await api.post('/auth/validate-reset-token', { token })

        // For now, simulate validation
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsTokenValid(true)
      } catch (error) {
        console.error('Token validation error:', error)
        setIsTokenValid(false)
        toast.error('El enlace de recuperación es inválido o ha expirado')
      }
    }

    validateToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    try {
      setIsLoading(true)

      // In a real app, you would call your API here
      // const response = await api.post('/auth/reset-password', {
      //   token,
      //   password: data.password
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setIsSuccess(true)
      toast.success('¡Contraseña restablecida exitosamente!')
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Error al restablecer la contraseña. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { text: 'Al menos 8 caracteres', met: form.watch('password')?.length >= 8 },
    { text: 'Una letra minúscula', met: /[a-z]/.test(form.watch('password') || '') },
    { text: 'Una letra mayúscula', met: /[A-Z]/.test(form.watch('password') || '') },
    { text: 'Un número', met: /\d/.test(form.watch('password') || '') },
  ]

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Validando enlace de recuperación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaLock className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Enlace Inválido
            </CardTitle>
            <CardDescription>
              Este enlace de recuperación de contraseña es inválido o ha expirado.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Los enlaces de recuperación expiran después de 24 horas por seguridad.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/recuperar-password')}
                className="w-full"
              >
                Solicitar Nuevo Enlace
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
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              ¡Contraseña Restablecida!
            </CardTitle>
            <CardDescription>
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Ir al Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Tu nueva contraseña"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <FaEyeSlash className="h-4 w-4" />
                          ) : (
                            <FaEye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Requirements */}
              {form.watch('password') && (
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <FaCheckCircle
                        className={`mr-2 h-3 w-3 ${
                          req.met ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirma tu nueva contraseña"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="h-4 w-4" />
                          ) : (
                            <FaEye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
                {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}