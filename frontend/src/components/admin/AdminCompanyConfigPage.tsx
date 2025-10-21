import React, { useState, useEffect } from 'react'
import { FaBuilding, FaSave, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaIdCard } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminSystemService } from '@/services/admin'
import type { SystemConfig } from '@/types/admin'

interface CompanyInfo {
  name: string
  legalName: string
  taxId: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website: string
  }
  registration: {
    number: string
    date: string
    authority: string
  }
  banking: {
    bankName: string
    accountNumber: string
    accountType: string
  }
}

const AdminCompanyConfigPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    legalName: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Guatemala',
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    registration: {
      number: '',
      date: '',
      authority: '',
    },
    banking: {
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Cargar configuración actual
  const loadConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const configData = await adminSystemService.getSystemConfig()
      setConfig(configData)

      // Cargar información de la empresa desde configuración extendida
      // TODO: Implementar endpoint específico para configuración de empresa
      // Por ahora usamos valores por defecto
    } catch (err: any) {
      console.error('Error cargando configuración:', err)
      setError('Error al cargar la configuración de la empresa')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración de empresa
  const handleSaveCompanyInfo = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      // TODO: Implementar endpoint para guardar configuración de empresa
      // await adminSystemService.updateCompanyConfig(companyInfo)

      // Por ahora simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess('Información de la empresa guardada exitosamente')

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error guardando configuración de empresa:', err)
      setError(err.message || 'Error al guardar la información de la empresa')
    } finally {
      setIsSaving(false)
    }
  }

  // Actualizar información de la empresa
  const updateCompanyInfo = (section: keyof CompanyInfo, field: string, value: any) => {
    setCompanyInfo(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [field]: value }
        : value,
    }))
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Configuración', href: '/admin/configuracion' },
    { label: 'Empresa' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Configuración de Empresa" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Configuración de Empresa" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Mensajes de estado */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimes className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaSave className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información General de la Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaBuilding className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Nombre Comercial</Label>
                <Input
                  id="companyName"
                  value={companyInfo.name}
                  onChange={(e) => updateCompanyInfo('name', '', e.target.value)}
                  placeholder="TradeConnect S.A."
                />
              </div>
              <div>
                <Label htmlFor="legalName">Razón Social</Label>
                <Input
                  id="legalName"
                  value={companyInfo.legalName}
                  onChange={(e) => updateCompanyInfo('legalName', '', e.target.value)}
                  placeholder="TradeConnect Sociedad Anónima"
                />
              </div>
              <div>
                <Label htmlFor="taxId">NIT</Label>
                <Input
                  id="taxId"
                  value={companyInfo.taxId}
                  onChange={(e) => updateCompanyInfo('taxId', '', e.target.value)}
                  placeholder="12345678-9"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: XXXXXXXX-X
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaMapMarkerAlt className="h-5 w-5" />
              Dirección Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Dirección</Label>
                <Textarea
                  id="street"
                  value={companyInfo.address.street}
                  onChange={(e) => updateCompanyInfo('address', 'street', e.target.value)}
                  placeholder="Zona 10, 5ta Avenida 5-55"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={companyInfo.address.city}
                    onChange={(e) => updateCompanyInfo('address', 'city', e.target.value)}
                    placeholder="Guatemala"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Departamento</Label>
                  <Select
                    value={companyInfo.address.state}
                    onValueChange={(value) => updateCompanyInfo('address', 'state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Guatemala">Guatemala</SelectItem>
                      <SelectItem value="Sacatepéquez">Sacatepéquez</SelectItem>
                      <SelectItem value="Chimaltenango">Chimaltenango</SelectItem>
                      <SelectItem value="Escuintla">Escuintla</SelectItem>
                      <SelectItem value="Santa Rosa">Santa Rosa</SelectItem>
                      <SelectItem value="Sololá">Sololá</SelectItem>
                      <SelectItem value="Totonicapán">Totonicapán</SelectItem>
                      <SelectItem value="Quetzaltenango">Quetzaltenango</SelectItem>
                      <SelectItem value="Suchitepéquez">Suchitepéquez</SelectItem>
                      <SelectItem value="Retalhuleu">Retalhuleu</SelectItem>
                      <SelectItem value="San Marcos">San Marcos</SelectItem>
                      <SelectItem value="Huehuetenango">Huehuetenango</SelectItem>
                      <SelectItem value="Quiché">Quiché</SelectItem>
                      <SelectItem value="Baja Verapaz">Baja Verapaz</SelectItem>
                      <SelectItem value="Alta Verapaz">Alta Verapaz</SelectItem>
                      <SelectItem value="Petén">Petén</SelectItem>
                      <SelectItem value="Izabal">Izabal</SelectItem>
                      <SelectItem value="Zacapa">Zacapa</SelectItem>
                      <SelectItem value="Chiquimula">Chiquimula</SelectItem>
                      <SelectItem value="Jalapa">Jalapa</SelectItem>
                      <SelectItem value="Jutiapa">Jutiapa</SelectItem>
                      <SelectItem value="El Progreso">El Progreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    value={companyInfo.address.zipCode}
                    onChange={(e) => updateCompanyInfo('address', 'zipCode', e.target.value)}
                    placeholder="01010"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaPhone className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={companyInfo.contact.phone}
                  onChange={(e) => updateCompanyInfo('contact', 'phone', e.target.value)}
                  placeholder="+502 2234 5678"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={companyInfo.contact.email}
                  onChange={(e) => updateCompanyInfo('contact', 'email', e.target.value)}
                  placeholder="info@tradeconnect.gt"
                />
              </div>
              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={companyInfo.contact.website}
                  onChange={(e) => updateCompanyInfo('contact', 'website', e.target.value)}
                  placeholder="https://tradeconnect.gt"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registro Mercantil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaIdCard className="h-5 w-5" />
              Registro Mercantil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="registrationNumber">Número de Registro</Label>
                <Input
                  id="registrationNumber"
                  value={companyInfo.registration.number}
                  onChange={(e) => updateCompanyInfo('registration', 'number', e.target.value)}
                  placeholder="123456789"
                />
              </div>
              <div>
                <Label htmlFor="registrationDate">Fecha de Registro</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={companyInfo.registration.date}
                  onChange={(e) => updateCompanyInfo('registration', 'date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="registrationAuthority">Autoridad Registradora</Label>
                <Input
                  id="registrationAuthority"
                  value={companyInfo.registration.authority}
                  onChange={(e) => updateCompanyInfo('registration', 'authority', e.target.value)}
                  placeholder="Registro Mercantil de Guatemala"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Bancaria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaBuilding className="h-5 w-5" />
              Información Bancaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bankName">Nombre del Banco</Label>
                <Input
                  id="bankName"
                  value={companyInfo.banking.bankName}
                  onChange={(e) => updateCompanyInfo('banking', 'bankName', e.target.value)}
                  placeholder="Banco Industrial"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Número de Cuenta</Label>
                <Input
                  id="accountNumber"
                  value={companyInfo.banking.accountNumber}
                  onChange={(e) => updateCompanyInfo('banking', 'accountNumber', e.target.value)}
                  placeholder="123-456789-0"
                />
              </div>
              <div>
                <Label htmlFor="accountType">Tipo de Cuenta</Label>
                <Select
                  value={companyInfo.banking.accountType}
                  onValueChange={(value) => updateCompanyInfo('banking', 'accountType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Cuenta Corriente</SelectItem>
                    <SelectItem value="savings">Cuenta de Ahorros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Legal */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <FaIdCard className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Información Legal Importante
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• La información proporcionada debe coincidir exactamente con los registros oficiales</li>
                  <li>• El NIT debe estar registrado en la SAT de Guatemala</li>
                  <li>• La dirección fiscal debe ser la misma que aparece en el registro mercantil</li>
                  <li>• Esta información se utilizará en facturas y documentos oficiales</li>
                  <li>• Cualquier cambio debe ser reportado a las autoridades correspondientes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => loadConfig()}
            disabled={isSaving}
          >
            <FaTimes className="h-4 w-4 mr-2" />
            Cancelar Cambios
          </Button>
          <Button
            onClick={handleSaveCompanyInfo}
            disabled={isSaving}
          >
            <FaSave className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Información'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminCompanyConfigPage