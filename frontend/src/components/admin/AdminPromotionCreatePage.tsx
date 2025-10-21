import React, { useState } from 'react'
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa'
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
  CreatePromotionRequest,
  PromotionRule,
} from '@/types/admin'
import { PROMOTION_TYPES } from '@/types/admin'

const AdminPromotionCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: '',
    description: '',
    type: PROMOTION_TYPES.GENERAL,
    isActive: true,
    startDate: undefined,
    endDate: undefined,
    eventIds: [],
    categoryIds: [],
    minPurchaseAmount: undefined,
    userTypes: [],
    isStackable: false,
    priority: 1,
    createdBy: 1, // TODO: Get from auth context
  })

  const [rules, setRules] = useState<PromotionRule[]>([])

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof CreatePromotionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Agregar regla
  const handleAddRule = () => {
    const newRule: PromotionRule = {
      type: 'cart_total',
      operator: 'greater_than',
      value: 0,
      isActive: true,
      priority: rules.length + 1,
      promotionId: 0, // Se asignará al crear
    }
    setRules(prev => [...prev, newRule])
  }

  // Actualizar regla
  const handleUpdateRule = (index: number, field: keyof PromotionRule, value: any) => {
    setRules(prev => prev.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    ))
  }

  // Eliminar regla
  const handleRemoveRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre de la promoción es requerido')
      }

      if (formData.type === PROMOTION_TYPES.EVENT_SPECIFIC && (!formData.eventIds || formData.eventIds.length === 0)) {
        throw new Error('Debe seleccionar al menos un evento para promociones específicas de evento')
      }

      if (formData.type === PROMOTION_TYPES.CATEGORY_SPECIFIC && (!formData.categoryIds || formData.categoryIds.length === 0)) {
        throw new Error('Debe seleccionar al menos una categoría para promociones específicas de categoría')
      }

      // Crear promoción
      const promotion = await adminPromotionService.createPromotion(formData)

      // Crear reglas si existen
      if (rules.length > 0) {
        await Promise.all(rules.map(rule =>
          adminPromotionService.createPromotionRule(promotion.id, {
            ...rule,
            promotionId: promotion.id,
          } as any)
        ))
      }

      // TODO: Navigate to promotions list with success message
      console.log('Promoción creada:', promotion)
    } catch (err: any) {
      console.error('Error creando promoción:', err)
      setError(err.message || 'Error al crear la promoción')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Promociones', href: '/admin/promociones' },
    { label: 'Crear Promoción' },
  ]

  return (
    <AdminLayout title="Crear Promoción" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Crear Nueva Promoción</h1>
            <p className="text-gray-600">Configure los detalles de la nueva promoción</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => {/* TODO: Navigate back */}}>
              <FaArrowLeft className="mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <FaSave className="mr-2" />
              {loading ? 'Creando...' : 'Crear Promoción'}
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTrash className="h-5 w-5 text-red-500" />
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
                  <Label htmlFor="name">Nombre de la Promoción *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Descuento de temporada"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Promoción</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value as PROMOTION_TYPES)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PROMOTION_TYPES.GENERAL}>General</SelectItem>
                      <SelectItem value={PROMOTION_TYPES.EVENT_SPECIFIC}>Evento Específico</SelectItem>
                      <SelectItem value={PROMOTION_TYPES.CATEGORY_SPECIFIC}>Categoría Específica</SelectItem>
                      <SelectItem value={PROMOTION_TYPES.MEMBERSHIP}>Membresía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe los detalles de la promoción"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                  />
                </div>
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
                  <Label htmlFor="isActive">Activa</Label>
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
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reglas de aplicación */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reglas de Aplicación</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddRule}>
                  <FaPlus className="mr-2" />
                  Agregar Regla
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay reglas configuradas. La promoción se aplicará a todos los usuarios que cumplan con los criterios básicos.
                </p>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Regla {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRule(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Tipo de Regla</Label>
                          <Select
                            value={rule.type}
                            onValueChange={(value) => handleUpdateRule(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cart_total">Total del Carrito</SelectItem>
                              <SelectItem value="item_count">Cantidad de Items</SelectItem>
                              <SelectItem value="user_type">Tipo de Usuario</SelectItem>
                              <SelectItem value="event_category">Categoría de Evento</SelectItem>
                              <SelectItem value="date_range">Rango de Fechas</SelectItem>
                              <SelectItem value="first_time">Primer Compra</SelectItem>
                              <SelectItem value="loyalty_tier">Nivel de Lealtad</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Operador</Label>
                          <Select
                            value={rule.operator}
                            onValueChange={(value) => handleUpdateRule(index, 'operator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Igual a</SelectItem>
                              <SelectItem value="greater_than">Mayor que</SelectItem>
                              <SelectItem value="less_than">Menor que</SelectItem>
                              <SelectItem value="between">Entre</SelectItem>
                              <SelectItem value="in">En</SelectItem>
                              <SelectItem value="not_in">No en</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Valor</Label>
                          <Input
                            type={typeof rule.value === 'number' ? 'number' : 'text'}
                            value={rule.value}
                            onChange={(e) => handleUpdateRule(index, 'value',
                              typeof rule.value === 'number' ? parseFloat(e.target.value) : e.target.value
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox
                          checked={rule.isActive}
                          onCheckedChange={(checked) => handleUpdateRule(index, 'isActive', checked)}
                        />
                        <Label>Regla activa</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminPromotionCreatePage