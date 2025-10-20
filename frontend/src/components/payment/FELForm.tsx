import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaFileInvoice, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { felSchema, type FELFormData } from '@/schemas'
import { showToast } from '@/utils/toast'
import { cn } from '@/lib/utils'

interface FELFormProps {
  onSubmit: (data: FELFormData) => Promise<void>
  onSkip?: () => void
  initialData?: Partial<FELFormData>
  required?: boolean
  className?: string
}

export const FELForm: React.FC<FELFormProps> = ({
  onSubmit,
  onSkip,
  initialData,
  required = false,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const form = useForm<FELFormData>({
    resolver: zodResolver(felSchema),
    defaultValues: {
      nit: initialData?.nit || '',
      name: initialData?.name || '',
      address: initialData?.address || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
    },
  })

  const handleSubmit = async (data: FELFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      showToast.success('Datos FEL guardados correctamente')
    } catch (error: any) {
      console.error('FEL submission error:', error)
      showToast.error(error.response?.data?.error || 'Error al guardar datos FEL')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (required) {
      showToast.warning('Los datos FEL son requeridos para facturación')
      return
    }
    onSkip?.()
  }

  const validateNIT = async (nit: string): Promise<boolean> => {
    if (!nit || nit.length < 4) return false

    try {
      setIsValidating(true)
      // This would typically call an API to validate NIT
      // For now, we'll simulate validation
      const isValid = /^\d{4,14}$/.test(nit)

      if (!isValid) {
        form.setError('nit', {
          type: 'manual',
          message: 'NIT debe contener solo números (4-14 dígitos)'
        })
        return false
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Additional validation logic could go here
      // For example, check against SAT database

      return true
    } catch (error) {
      form.setError('nit', {
        type: 'manual',
        message: 'Error al validar NIT'
      })
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const nitValue = form.watch('nit')
  const isNITValid = nitValue && nitValue.length >= 4 && /^\d{4,14}$/.test(nitValue)

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaFileInvoice className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Factura Electrónica (FEL)</span>
              {required && (
                <Badge variant="destructive" className="text-xs">
                  Requerido
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Información necesaria para generar tu factura electrónica conforme a la SAT
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Alert className="mb-6">
          <FaInfoCircle className="h-4 w-4" />
          <AlertDescription>
            La Factura Electrónica en Línea (FEL) es obligatoria para todas las transacciones comerciales en Guatemala.
            Esta información se utiliza únicamente para generar tu comprobante fiscal.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* NIT Field with Validation */}
            <FormField
              control={form.control}
              name="nit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <span>NIT</span>
                    <Badge variant="outline" className="text-xs">
                      Obligatorio
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="123456789"
                        maxLength={14}
                        className={cn(
                          isNITValid && 'border-green-500 focus:border-green-500',
                          !isNITValid && field.value && 'border-red-500 focus:border-red-500'
                        )}
                      />
                      {isValidating && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                      )}
                      {isNITValid && !isValidating && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <FaCheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1">
                    Ingresa tu NIT sin guiones (mínimo 4 dígitos, máximo 14)
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Información del Contribuyente</h4>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre o Razón Social</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre completo o razón social" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dirección completa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@empresa.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+502 1234 5678" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Important Notice */}
            <Alert>
              <FaExclamationTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Asegúrate de que la información proporcionada sea correcta.
                Los datos FEL no se pueden modificar después de emitida la factura.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Datos FEL'}
              </Button>

              {!required && onSkip && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                >
                  Omitir por ahora
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">¿Dónde encuentro mi NIT?</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• En tu DPI (Documento Personal de Identificación)</li>
            <li>• En el certificado de NIT emitido por la SAT</li>
            <li>• En facturas anteriores o registros tributarios</li>
            <li>• Si eres empresa, en tu patente de comercio</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}