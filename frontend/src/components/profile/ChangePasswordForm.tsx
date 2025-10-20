import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas'
import { showToast } from '@/utils/toast'
import { cn } from '@/lib/utils'

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormData) => Promise<void>
  onCancel?: () => void
  className?: string
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  onCancel,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPassword = form.watch('newPassword')

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    strength = Object.values(checks).filter(Boolean).length

    return {
      score: strength,
      checks,
      percentage: (strength / 5) * 100,
      label: strength <= 2 ? 'Débil' : strength <= 3 ? 'Regular' : strength <= 4 ? 'Buena' : 'Excelente',
      color: strength <= 2 ? 'bg-red-500' : strength <= 3 ? 'bg-yellow-500' : strength <= 4 ? 'bg-blue-500' : 'bg-green-500',
    }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const handleSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      form.reset()
      showToast.success('Contraseña cambiada exitosamente')
    } catch (error: any) {
      console.error('Password change error:', error)
      showToast.error(error.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaLock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>
              Actualiza tu contraseña para mantener tu cuenta segura
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Actual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
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

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <FaEyeSlash className="h-4 w-4" />
                        ) : (
                          <FaEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fortaleza:</span>
                        <span className={cn(
                          'font-medium',
                          passwordStrength.score <= 2 ? 'text-red-600' :
                          passwordStrength.score <= 3 ? 'text-yellow-600' :
                          passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                        )}>
                          {passwordStrength.label}
                        </span>
                      </div>

                      <Progress
                        value={passwordStrength.percentage}
                        className="h-2"
                      />

                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'
                        )}>
                          <FaCheckCircle className="h-3 w-3" />
                          <span>8+ caracteres</span>
                        </div>
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'
                        )}>
                          <FaCheckCircle className="h-3 w-3" />
                          <span>Mayúscula</span>
                        </div>
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'
                        )}>
                          <FaCheckCircle className="h-3 w-3" />
                          <span>Minúscula</span>
                        </div>
                        <div className={cn(
                          'flex items-center space-x-1',
                          passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'
                        )}>
                          <FaCheckCircle className="h-3 w-3" />
                          <span>Número</span>
                        </div>
                        <div className={cn(
                          'flex items-center space-x-1 col-span-2',
                          passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'
                        )}>
                          <FaCheckCircle className="h-3 w-3" />
                          <span>Carácter especial</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

            {/* Security Notice */}
            <Alert>
              <FaExclamationTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recomendaciones de seguridad:</strong>
                <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                  <li>Usa una contraseña única para esta cuenta</li>
                  <li>No compartas tu contraseña con nadie</li>
                  <li>Cambia tu contraseña regularmente</li>
                  <li>Evita usar información personal obvia</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || passwordStrength.score < 3}
              >
                {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              )}
            </div>

            {passwordStrength.score < 3 && newPassword && (
              <p className="text-sm text-red-600 text-center">
                La contraseña debe tener al menos una fortaleza "Buena" para continuar
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}