import React, { useState } from 'react'
import { FaSave, FaArrowLeft, FaMagic, FaCopy } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminPromotionService } from '@/services/admin'
import type {
  CreatePromoCodeRequest,
} from '@/types/admin'
import { DISCOUNT_TYPES } from '@/types/admin'

const AdminPromoCodeCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [formData, setFormData] = useState<CreatePromoCodeRequest>({
    code: '',
    name: '',
    description: '',
    discountType: DISCOUNT_TYPES.PERCENTAGE,
    discountValue: 0,
    startDate: undefined,
    endDate: undefined,
    maxUsesTotal: undefined,
    maxUsesPerUser: 1,
    isActive: true,
    minPurchaseAmount: undefined,
    maxDiscountAmount: undefined,
    isStackable: false,
    promotionId: undefined,
    createdBy: 1, // TODO: Get from auth context
  })

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof CreatePromoCodeRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Generar código automático
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedCode(result)
    setFormData(prev => ({ ...prev, code: result }))
  }

  // Copiar código al portapapeles
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(formData.code)
      // TODO: Show success toast
    } catch (err) {
      console.error('Error copying code:', err)
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Validaciones básicas
      if (!formData.code.trim()) {
        throw new Error('El código promocional es requerido')
      }

      if (!formData.name.trim()) {
        throw new Error('El nombre del código promocional es requerido')
      }

      if (formData.discountValue <= 0) {
        throw new Error('El valor del descuento debe ser mayor a 0')
      }

      // Validaciones específicas por tipo de descuento
      if (formData.discountType === DISCOUNT_TYPES.PERCENTAGE && formData.discountValue > 100) {
        throw new Error('El porcentaje de descuento no puede ser mayor al 100%')
      }

      if (formData.maxUsesPerUser <= 0) {
        throw new Error('Los usos por usuario deben ser al menos 1')
      }

      if (formData.maxUsesTotal && formData.maxUsesTotal <= 0) {
        throw new Error('Los usos totales deben ser mayor a 0')
      }

      if (formData.minPurchaseAmount && formData.minPurchaseAmount <= 0) {
        throw new Error('El monto mínimo de compra debe ser mayor a 0')
      }

      if (formData.maxDiscountAmount && formData.maxDiscountAmount <= 0) {
        throw new Error('El monto máximo de descuento debe ser mayor a 0')
      }

      // Validar fechas
      if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
      }

      // Crear código promocional
      const promoCode = await adminPromotionService.createPromoCode(formData)

      // TODO: Navigate to promo codes list with success message
      console.log('Código promocional creado:', promoCode)
    } catch (err: any) {
      console.error('Error creando código promocional:', err)
      setError(err.message || 'Error al crear el código promocional')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Códigos Promocionales', href: '/admin/codigos-descuento' },
    { label: 'Crear Código' },
  ]

  return (
    <AdminLayout title="Crear Código Promocional" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Crear Código Promocional</h1>
            <p className="text-gray-600">Configure los detalles del nuevo código promocional</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => {/* TODO: Navigate back */}}>
              <FaArrowLeft className="mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <FaSave className="mr-2" />
              {loading ? 'Creando...' : 'Crear Código'}
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaCopy className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código Promocional *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="Ej: VERANO2024"
                      className="font-mono"
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      <FaMagic className="mr-2" />
                      Generar
                    </Button>
                    {formData.code && (
                      <Button type="button" variant="outline" onClick={copyCode}>
                        <FaCopy className="mr-2" />
                        Copiar
                      </Button>
                    )}
                  </div>
                  {generatedCode && (
                    <p className="text-sm text-gray-600 mt-1">
                      Código generado automáticamente: <code className="bg-gray-100 px-1 rounded">{generatedCode}</code>
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="name">Nombre del Código *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Descuento de Verano"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe el propósito de este código promocional"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de descuento */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Descuento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discountType">Tipo de Descuento</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => handleInputChange('discountType', value as DISCOUNT_TYPES)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DISCOUNT_TYPES.PERCENTAGE}>Porcentaje (%)</SelectItem>
                      <SelectItem value={DISCOUNT_TYPES.FIXED_AMOUNT}>Monto Fijo (Q)</SelectItem>
                      <SelectItem value={DISCOUNT_TYPES.BUY_X_GET_Y}>Compra X Lleva Y</SelectItem>
                      <SelectItem value={DISCOUNT_TYPES.SPECIAL_PRICE}>Precio Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discountValue">
                    Valor del Descuento * {formData.discountType === DISCOUNT_TYPES.PERCENTAGE ? '(%)' : '(Q)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    step={formData.discountType === DISCOUNT_TYPES.PERCENTAGE ? "1" : "0.01"}
                    max={formData.discountType === DISCOUNT_TYPES.PERCENTAGE ? "100" : undefined}
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value))}
                    placeholder={formData.discountType === DISCOUNT_TYPES.PERCENTAGE ? "10" : "50.00"}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxDiscountAmount">Monto Máximo de Descuento</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Q0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchaseAmount">Monto Mínimo de Compra</Label>
                  <Input
                    id="minPurchaseAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minPurchaseAmount || ''}
                    onChange={(e) => handleInputChange('minPurchaseAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Q0.00"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Código activo</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStackable"
                  checked={formData.isStackable}
                  onCheckedChange={(checked) => handleInputChange('isStackable', checked)}
                />
                <Label htmlFor="isStackable">Acumulable con otras promociones</Label>
              </div>
            </CardContent>
          </Card>

          {/* Límites de uso */}
          <Card>
            <CardHeader>
              <CardTitle>Límites de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUsesTotal">Usos Totales Máximos</Label>
                  <Input
                    id="maxUsesTotal"
                    type="number"
                    min="1"
                    value={formData.maxUsesTotal || ''}
                    onChange={(e) => handleInputChange('maxUsesTotal', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Sin límite"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Número máximo de veces que se puede usar este código en total
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxUsesPerUser">Usos por Usuario *</Label>
                  <Input
                    id="maxUsesPerUser"
                    type="number"
                    min="1"
                    value={formData.maxUsesPerUser}
                    onChange={(e) => handleInputChange('maxUsesPerUser', parseInt(e.target.value))}
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Número máximo de veces que un usuario puede usar este código
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas de validez */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas de Validez</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Si no se especifica, el código estará disponible inmediatamente
                  </p>
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Si no se especifica, el código no expirará
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asociación con promoción */}
          <Card>
            <CardHeader>
              <CardTitle>Asociación con Promoción (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="promotionId">Promoción Asociada</Label>
                <Select
                  value={formData.promotionId?.toString() || ''}
                  onValueChange={(value) => handleInputChange('promotionId', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar promoción (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Load promotions from API */}
                    <SelectItem value="">Sin promoción asociada</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  Si se asocia con una promoción, el código heredará las reglas de la promoción
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminPromoCodeCreatePage