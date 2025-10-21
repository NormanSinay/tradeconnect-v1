import React, { useState, useEffect } from 'react'
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
  PromotionResponse,
  UpdatePromotionRequest,
  PromotionType,
  PromotionRule,
} from '@/types/admin'

interface AdminPromotionEditPageProps {
  promotionId?: number
}

const AdminPromotionEditPage: React.FC<AdminPromotionEditPageProps> = ({ promotionId }) => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promotion, setPromotion] = useState<PromotionResponse | null>(null)
  const [formData, setFormData] = useState<UpdatePromotionRequest>({})
  const [rules, setRules] = useState<PromotionRule[]>([])

  // Cargar promoción y reglas
  useEffect(() => {
    if (promotionId) {
      loadPromotion()
    }
  }, [promotionId])

  const loadPromotion = async () => {
    try {
      setFetching(true)
      setError(null)

      const [promotionData, rulesData] = await Promise.all([
        adminPromotionService.getPromotionById(promotionId!),
        adminPromotionService.getPromotionRules(promotionId!),
      ])

      setPromotion(promotionData)
      setRules(rulesData)

      // Inicializar formData con los datos actuales
      setFormData({
        name: promotionData.name,
        description: promotionData.description,
        type: promotionData.type,
        isActive: promotionData.isActive,
        startDate: promotionData.startDate,
        endDate: promotionData.endDate,
        eventIds: promotionData.eventIds,
        categoryIds: promotionData.categoryIds,
        minPurchaseAmount: promotionData.minPurchaseAmount,
        userTypes: promotionData.userTypes,
        isStackable: promotionData.isStackable,
        priority: promotionData.priority,
        updatedBy: 1, // TODO: Get from auth context
      })
    } catch (err: any) {
      console.error('Error cargando promoción:', err)
      setError('Error al cargar la promoción')
    } finally {
      setFetching(false)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof UpdatePromotionRequest, value: any) => {
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
      promotionId: promotionId || 0,
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
  const handleRemoveRule = async (index: number) => {
    const rule = rules[index]
    if (rule && rule.id) {
      try {
        await adminPromotionService.deletePromotionRule(promotionId!, rule.id)
      } catch (err) {
        console.error('Error eliminando regla:', err)
        setError('Error al eliminar la regla')
        return
      }
    }
    setRules(prev => prev.filter((_, i) => i !== index))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!promotion) return

    try {
      setLoading(true)
      setError(null)

      // Validaciones básicas
      if (formData.name && !formData.name.trim()) {
        throw new Error('El nombre de la promoción no puede estar vacío')
      }

      if (formData.type === 'EVENT_SPECIFIC' && (!formData.eventIds || formData.eventIds.length === 0)) {
        throw new Error('Debe seleccionar al menos un evento para promociones específicas de evento')
      }

      if (formData.type === 'CATEGORY_SPECIFIC' && (!formData.categoryIds || formData.categoryIds.length === 0)) {
        throw new Error('Debe seleccionar al menos una categoría para promociones específicas de categoría')
      }

      // Actualizar promoción
      const updatedPromotion = await adminPromotionService.updatePromotion(promotion.id, formData)

      // Manejar reglas
      const existingRuleIds = rules.filter(r => r.id).map(r => r.id!)
      const newRules = rules.filter(r => !r.id)
      const updatedRules = rules.filter(r => r.id)

      // Crear nuevas reglas
      if (newRules.length > 0) {
        await Promise.all(newRules.map(rule =>
          adminPromotionService.createPromotionRule(promotion.id, rule)
        ))
      }

      // Actualizar reglas existentes
      if (updatedRules.length > 0) {
        await Promise.all(updatedRules.map(rule =>
          adminPromotionService.updatePromotionRule(promotion.id, rule.id!, {
            type: rule.type,
            operator: rule.operator,
            value: rule.value,
            isActive: rule.isActive,
            priority: rule.priority,
          })
        ))
      }

      // Recargar datos
      await loadPromotion()

      // TODO: Show success message
      console.log('Promoción actualizada:', updatedPromotion)
    } catch (err: any) {
      console.error('Error actualizando promoción:', err)
      setError(err.message || 'Error al actualizar la promoción')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <AdminLayout title="Editar Promoción" breadcrumbs={[]}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!promotion) {
    return (
      <AdminLayout title="Editar Promoción" breadcrumbs={[]}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Promoción no encontrada</h2>
          <p className="text-gray-600 mt-2">La promoción que intenta editar no existe.</p>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Promociones', href: '/admin/promociones' },
    { label: `Editar: ${promotion.name}` },
  ]

  return (
    <AdminLayout title="Editar Promoción" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Editar Promoción</h1>
            <p className="text-gray-600">Modifique los detalles de la promoción</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => {/* TODO: Navigate back */}}>
              <FaArrowLeft className="mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <FaSave className="mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
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
                    value={formData.name || promotion.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Descuento de temporada"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Promoción</Label>
                  <Select
                    value={formData.type || promotion.type}
                    onValueChange={(value) => handleInputChange('type', value as PromotionType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="EVENT_SPECIFIC">Evento Específico</SelectItem>
                      <SelectItem value="CATEGORY_SPECIFIC">Categoría Específica</SelectItem>
                      <SelectItem value="MEMBERSHIP">Membresía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description !== undefined ? formData.description || '' : promotion.description || ''}
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
                    value={formData.priority || promotion.priority}
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
                    value={formData.minPurchaseAmount !== undefined ? formData.minPurchaseAmount || '' : promotion.minPurchaseAmount || ''}
                    onChange={(e) => handleInputChange('minPurchaseAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Q0.00"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive !== undefined ? formData.isActive : promotion.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Activa</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStackable"
                  checked={formData.isStackable !== undefined ? formData.isStackable : promotion.isStackable}
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
                    value={formData.startDate !== undefined
                      ? (formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : '')
                      : (promotion.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : '')
                    }
                    onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate !== undefined
                      ? (formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : '')
                      : (promotion.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : '')
                    }
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
                    <div key={rule.id || index} className="border rounded-lg p-4">
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

export default AdminPromotionEditPage