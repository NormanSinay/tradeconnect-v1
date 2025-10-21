import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaSave, FaExclamationTriangle, FaCog, FaUsers, FaCreditCard, FaBell, FaShieldAlt } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { adminEventService } from '@/services/admin'
import type { DetailedEvent, EventStats } from '@/types/admin'

const AdminEventConfigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<DetailedEvent | null>(null)
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configuraciones
  const [capacityConfig, setCapacityConfig] = useState({
    maxCapacity: 0,
    allowWaitlist: false,
    waitlistLimit: 0,
    autoCloseRegistrations: false,
    closeRegistrationsDate: '',
  })

  const [pricingConfig, setPricingConfig] = useState({
    earlyBirdDiscount: 0,
    earlyBirdDeadline: '',
    groupDiscount: 0,
    groupMinSize: 0,
    paymentDeadline: '',
    allowRefunds: true,
    refundPolicy: '',
  })

  const [notificationConfig, setNotificationConfig] = useState({
    notifyOnRegistration: true,
    notifyOnPayment: true,
    notifyOnCancellation: true,
    reminderDays: 7,
    customMessage: '',
  })

  const [securityConfig, setSecurityConfig] = useState({
    requireApproval: false,
    allowGuestRegistrations: true,
    maxRegistrationsPerUser: 1,
    requireDocumentVerification: false,
    customTerms: '',
  })

  const eventId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (eventId) {
      loadEvent()
      loadStats()
    }
  }, [eventId])

  const loadEvent = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      const eventData = await adminEventService.getEventById(eventId)
      setEvent(eventData)

      // Cargar configuraciones desde metadata
      const metadata = eventData.metadata || {}
      setCapacityConfig({
        maxCapacity: eventData.capacity || 0,
        allowWaitlist: metadata.allowWaitlist || false,
        waitlistLimit: metadata.waitlistLimit || 0,
        autoCloseRegistrations: metadata.autoCloseRegistrations || false,
        closeRegistrationsDate: metadata.closeRegistrationsDate || '',
      })

      setPricingConfig({
        earlyBirdDiscount: metadata.earlyBirdDiscount || 0,
        earlyBirdDeadline: metadata.earlyBirdDeadline || '',
        groupDiscount: metadata.groupDiscount || 0,
        groupMinSize: metadata.groupMinSize || 0,
        paymentDeadline: metadata.paymentDeadline || '',
        allowRefunds: metadata.allowRefunds !== false,
        refundPolicy: metadata.refundPolicy || '',
      })

      setNotificationConfig({
        notifyOnRegistration: metadata.notifyOnRegistration !== false,
        notifyOnPayment: metadata.notifyOnPayment !== false,
        notifyOnCancellation: metadata.notifyOnCancellation !== false,
        reminderDays: metadata.reminderDays || 7,
        customMessage: metadata.customMessage || '',
      })

      setSecurityConfig({
        requireApproval: metadata.requireApproval || false,
        allowGuestRegistrations: metadata.allowGuestRegistrations !== false,
        maxRegistrationsPerUser: metadata.maxRegistrationsPerUser || 1,
        requireDocumentVerification: metadata.requireDocumentVerification || false,
        customTerms: metadata.customTerms || '',
      })
    } catch (err) {
      console.error('Error cargando evento:', err)
      setError('Error al cargar los datos del evento')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!eventId) return

    try {
      const statsData = await adminEventService.getEventStats(eventId)
      setStats(statsData)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleSave = async () => {
    if (!event) return

    try {
      setSaving(true)
      setError(null)

      const metadata = {
        ...event.metadata,
        // Capacity
        allowWaitlist: capacityConfig.allowWaitlist,
        waitlistLimit: capacityConfig.waitlistLimit,
        autoCloseRegistrations: capacityConfig.autoCloseRegistrations,
        closeRegistrationsDate: capacityConfig.closeRegistrationsDate,
        // Pricing
        earlyBirdDiscount: pricingConfig.earlyBirdDiscount,
        earlyBirdDeadline: pricingConfig.earlyBirdDeadline,
        groupDiscount: pricingConfig.groupDiscount,
        groupMinSize: pricingConfig.groupMinSize,
        paymentDeadline: pricingConfig.paymentDeadline,
        allowRefunds: pricingConfig.allowRefunds,
        refundPolicy: pricingConfig.refundPolicy,
        // Notifications
        notifyOnRegistration: notificationConfig.notifyOnRegistration,
        notifyOnPayment: notificationConfig.notifyOnPayment,
        notifyOnCancellation: notificationConfig.notifyOnCancellation,
        reminderDays: notificationConfig.reminderDays,
        customMessage: notificationConfig.customMessage,
        // Security
        requireApproval: securityConfig.requireApproval,
        allowGuestRegistrations: securityConfig.allowGuestRegistrations,
        maxRegistrationsPerUser: securityConfig.maxRegistrationsPerUser,
        requireDocumentVerification: securityConfig.requireDocumentVerification,
        customTerms: securityConfig.customTerms,
      }

      await adminEventService.updateEvent(eventId!, {
        capacity: capacityConfig.maxCapacity,
        metadata,
      })

      // Recargar datos
      await loadEvent()
      setError(null)
    } catch (err) {
      console.error('Error guardando configuración:', err)
      setError('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: event?.title || 'Configuración', href: `/admin/eventos/${eventId}/configuracion` },
  ]

  if (loading) {
    return (
      <AdminLayout title="Cargando..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout title="Error" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">No se pudo cargar el evento</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Configuración: ${event.title}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuración Avanzada</h1>
            <p className="text-gray-600">Configuraciones avanzadas para {event.title}</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaSave className="mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>

        {/* Información del evento */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <div className="mt-1">
                  <Badge variant="outline">{event.eventStatus.displayName}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Inscritos</Label>
                <div className="mt-1 text-lg font-semibold">
                  {stats?.totalRegistrations || 0}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Capacidad</Label>
                <div className="mt-1 text-lg font-semibold">
                  {event.capacity || 'Sin límite'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuraciones por pestañas */}
        <Tabs defaultValue="capacity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="capacity" className="flex items-center space-x-2">
              <FaUsers className="h-4 w-4" />
              <span>Capacidad</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-2">
              <FaCreditCard className="h-4 w-4" />
              <span>Precios</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <FaBell className="h-4 w-4" />
              <span>Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <FaShieldAlt className="h-4 w-4" />
              <span>Seguridad</span>
            </TabsTrigger>
          </TabsList>

          {/* Capacidad */}
          <TabsContent value="capacity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaUsers className="h-5 w-5" />
                  <span>Configuración de Capacidad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      min="1"
                      value={capacityConfig.maxCapacity}
                      onChange={(e) => setCapacityConfig(prev => ({
                        ...prev,
                        maxCapacity: Number(e.target.value)
                      }))}
                      placeholder="Sin límite"
                    />
                  </div>

                  <div>
                    <Label htmlFor="waitlistLimit">Límite de Lista de Espera</Label>
                    <Input
                      id="waitlistLimit"
                      type="number"
                      min="0"
                      value={capacityConfig.waitlistLimit}
                      onChange={(e) => setCapacityConfig(prev => ({
                        ...prev,
                        waitlistLimit: Number(e.target.value)
                      }))}
                      placeholder="Sin límite"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowWaitlist"
                      checked={capacityConfig.allowWaitlist}
                      onCheckedChange={(checked) => setCapacityConfig(prev => ({
                        ...prev,
                        allowWaitlist: checked
                      }))}
                    />
                    <Label htmlFor="allowWaitlist">Permitir lista de espera</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoCloseRegistrations"
                      checked={capacityConfig.autoCloseRegistrations}
                      onCheckedChange={(checked) => setCapacityConfig(prev => ({
                        ...prev,
                        autoCloseRegistrations: checked
                      }))}
                    />
                    <Label htmlFor="autoCloseRegistrations">Cerrar inscripciones automáticamente</Label>
                  </div>
                </div>

                {capacityConfig.autoCloseRegistrations && (
                  <div>
                    <Label htmlFor="closeRegistrationsDate">Fecha de cierre de inscripciones</Label>
                    <Input
                      id="closeRegistrationsDate"
                      type="datetime-local"
                      value={capacityConfig.closeRegistrationsDate}
                      onChange={(e) => setCapacityConfig(prev => ({
                        ...prev,
                        closeRegistrationsDate: e.target.value
                      }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Precios */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaCreditCard className="h-5 w-5" />
                  <span>Configuración de Precios</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="earlyBirdDiscount">Descuento Anticipado (%)</Label>
                    <Input
                      id="earlyBirdDiscount"
                      type="number"
                      min="0"
                      max="100"
                      value={pricingConfig.earlyBirdDiscount}
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev,
                        earlyBirdDiscount: Number(e.target.value)
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="groupDiscount">Descuento Grupos (%)</Label>
                    <Input
                      id="groupDiscount"
                      type="number"
                      min="0"
                      max="100"
                      value={pricingConfig.groupDiscount}
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev,
                        groupDiscount: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="earlyBirdDeadline">Fecha límite descuento anticipado</Label>
                    <Input
                      id="earlyBirdDeadline"
                      type="datetime-local"
                      value={pricingConfig.earlyBirdDeadline}
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev,
                        earlyBirdDeadline: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="groupMinSize">Tamaño mínimo para descuento grupal</Label>
                    <Input
                      id="groupMinSize"
                      type="number"
                      min="2"
                      value={pricingConfig.groupMinSize}
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev,
                        groupMinSize: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentDeadline">Fecha límite de pago</Label>
                  <Input
                    id="paymentDeadline"
                    type="datetime-local"
                    value={pricingConfig.paymentDeadline}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      paymentDeadline: e.target.value
                    }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowRefunds"
                    checked={pricingConfig.allowRefunds}
                    onCheckedChange={(checked) => setPricingConfig(prev => ({
                      ...prev,
                      allowRefunds: checked
                    }))}
                  />
                  <Label htmlFor="allowRefunds">Permitir reembolsos</Label>
                </div>

                <div>
                  <Label htmlFor="refundPolicy">Política de reembolso</Label>
                  <Textarea
                    id="refundPolicy"
                    value={pricingConfig.refundPolicy}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      refundPolicy: e.target.value
                    }))}
                    placeholder="Describe la política de reembolso..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificaciones */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaBell className="h-5 w-5" />
                  <span>Configuración de Notificaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifyOnRegistration"
                      checked={notificationConfig.notifyOnRegistration}
                      onCheckedChange={(checked) => setNotificationConfig(prev => ({
                        ...prev,
                        notifyOnRegistration: checked
                      }))}
                    />
                    <Label htmlFor="notifyOnRegistration">Notificar nuevas inscripciones</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifyOnPayment"
                      checked={notificationConfig.notifyOnPayment}
                      onCheckedChange={(checked) => setNotificationConfig(prev => ({
                        ...prev,
                        notifyOnPayment: checked
                      }))}
                    />
                    <Label htmlFor="notifyOnPayment">Notificar pagos confirmados</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifyOnCancellation"
                      checked={notificationConfig.notifyOnCancellation}
                      onCheckedChange={(checked) => setNotificationConfig(prev => ({
                        ...prev,
                        notifyOnCancellation: checked
                      }))}
                    />
                    <Label htmlFor="notifyOnCancellation">Notificar cancelaciones</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reminderDays">Días antes para recordatorio</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    min="1"
                    max="30"
                    value={notificationConfig.reminderDays}
                    onChange={(e) => setNotificationConfig(prev => ({
                      ...prev,
                      reminderDays: Number(e.target.value)
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="customMessage">Mensaje personalizado</Label>
                  <Textarea
                    id="customMessage"
                    value={notificationConfig.customMessage}
                    onChange={(e) => setNotificationConfig(prev => ({
                      ...prev,
                      customMessage: e.target.value
                    }))}
                    placeholder="Mensaje personalizado para notificaciones..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seguridad */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaShieldAlt className="h-5 w-5" />
                  <span>Configuración de Seguridad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireApproval"
                      checked={securityConfig.requireApproval}
                      onCheckedChange={(checked) => setSecurityConfig(prev => ({
                        ...prev,
                        requireApproval: checked
                      }))}
                    />
                    <Label htmlFor="requireApproval">Requerir aprobación manual</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowGuestRegistrations"
                      checked={securityConfig.allowGuestRegistrations}
                      onCheckedChange={(checked) => setSecurityConfig(prev => ({
                        ...prev,
                        allowGuestRegistrations: checked
                      }))}
                    />
                    <Label htmlFor="allowGuestRegistrations">Permitir inscripciones de invitados</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireDocumentVerification"
                      checked={securityConfig.requireDocumentVerification}
                      onCheckedChange={(checked) => setSecurityConfig(prev => ({
                        ...prev,
                        requireDocumentVerification: checked
                      }))}
                    />
                    <Label htmlFor="requireDocumentVerification">Requerir verificación de documentos</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxRegistrationsPerUser">Máximo de inscripciones por usuario</Label>
                  <Input
                    id="maxRegistrationsPerUser"
                    type="number"
                    min="1"
                    value={securityConfig.maxRegistrationsPerUser}
                    onChange={(e) => setSecurityConfig(prev => ({
                      ...prev,
                      maxRegistrationsPerUser: Number(e.target.value)
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="customTerms">Términos y condiciones personalizados</Label>
                  <Textarea
                    id="customTerms"
                    value={securityConfig.customTerms}
                    onChange={(e) => setSecurityConfig(prev => ({
                      ...prev,
                      customTerms: e.target.value
                    }))}
                    placeholder="Términos y condiciones adicionales..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminEventConfigPage