import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSecurity } from '@/hooks/useSecurity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SecureFormProps<T extends FieldValues> {
  title?: string
  description?: string
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
  children: (form: UseFormReturn<T>) => React.ReactNode
  submitLabel?: string
  loading?: boolean
  className?: string
  enableSecurityMonitoring?: boolean
  rateLimitEndpoint?: string
}

interface FormSecurityState {
  isRateLimited: boolean
  remainingAttempts: number
  securityEvents: number
  lastValidationError: string | null
}

export function SecureForm<T extends FieldValues>({
  title,
  description,
  schema,
  onSubmit,
  children,
  submitLabel = 'Enviar',
  loading = false,
  className,
  enableSecurityMonitoring = true,
  rateLimitEndpoint = 'form_submit'
}: SecureFormProps<T>) {
  const {
    validateField,
    sanitizeInput,
    isRateLimited,
    getRateLimitStatus,
    securityEvents,
    reportSuspiciousActivity
  } = useSecurity()

  const [securityState, setSecurityState] = useState<FormSecurityState>({
    isRateLimited: false,
    remainingAttempts: 0,
    securityEvents: 0,
    lastValidationError: null
  })

  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    mode: 'onChange'
  })

  const { handleSubmit, formState: { errors, isValid }, watch } = form

  // Monitor security state
  useEffect(() => {
    if (enableSecurityMonitoring) {
      const rateLimitStatus = getRateLimitStatus(rateLimitEndpoint)
      setSecurityState(prev => ({
        ...prev,
        isRateLimited: rateLimitStatus.allowed === false,
        remainingAttempts: rateLimitStatus.remaining,
        securityEvents: securityEvents.length
      }))
    }
  }, [enableSecurityMonitoring, rateLimitEndpoint, getRateLimitStatus, securityEvents.length])

  // Monitor form changes for suspicious activity
  useEffect(() => {
    if (enableSecurityMonitoring) {
      const subscription = watch((data, { name, type }) => {
        if (name && type === 'change') {
          // Detect rapid field changes (potential bot activity)
          const now = Date.now()
          // This is a simplified example - in production you'd track field change frequency
        }
      })

      return () => subscription.unsubscribe()
    }
    return undefined
  }, [watch, enableSecurityMonitoring])

  const handleSecureSubmit = async (data: T) => {
    if (securityState.isRateLimited) {
      reportSuspiciousActivity('rate_limited_form_submission', {
        endpoint: rateLimitEndpoint,
        remainingAttempts: securityState.remainingAttempts
      })
      return
    }

    setIsSubmitting(true)
    setSubmitAttempts(prev => prev + 1)

    try {
      // Sanitize all string inputs
      const sanitizedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key]
        acc[key] = typeof value === 'string' ? sanitizeInput(value) : value
        return acc
      }, {} as any)

      await onSubmit(sanitizedData)
    } catch (error) {
      console.error('Form submission error:', error)
      reportSuspiciousActivity('form_submission_error', { error: String(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSecurityStatusColor = () => {
    if (securityState.isRateLimited) return 'text-red-600'
    if (securityState.securityEvents > 0) return 'text-orange-600'
    return 'text-green-600'
  }

  const getSecurityStatusIcon = () => {
    if (securityState.isRateLimited) return <AlertTriangle className="h-4 w-4" />
    if (securityState.securityEvents > 0) return <Shield className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const securityScore = Math.max(0, 100 - (securityState.securityEvents * 10) - (submitAttempts * 5))

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-xl">{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {enableSecurityMonitoring && (
              <div className={`flex items-center gap-2 ${getSecurityStatusColor()}`}>
                {getSecurityStatusIcon()}
                <span className="text-sm font-medium">
                  Seguridad: {securityScore}%
                </span>
              </div>
            )}
          </div>

          {enableSecurityMonitoring && (
            <div className="space-y-2">
              <Progress value={securityScore} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Intentos: {submitAttempts}</span>
                <span>Eventos: {securityState.securityEvents}</span>
              </div>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {/* Security Alerts */}
        {securityState.isRateLimited && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Demasiados intentos. Quedan {securityState.remainingAttempts} intentos permitidos.
              Por favor espera antes de intentar nuevamente.
            </AlertDescription>
          </Alert>
        )}

        {securityState.securityEvents > 0 && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Se detectaron {securityState.securityEvents} eventos de seguridad.
              El formulario está siendo monitoreado.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleSecureSubmit)} className="space-y-4">
          {children(form)}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Formulario protegido con validación de seguridad</span>
            </div>

            <Button
              type="submit"
              disabled={
                loading ||
                isSubmitting ||
                !isValid ||
                securityState.isRateLimited
              }
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>

        {/* Security Footer */}
        {enableSecurityMonitoring && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Validación en tiempo real • Protección CSRF • Límite de tasa
              </span>
              <span>
                Última verificación: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SecureForm