import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaDownload, FaFileExcel, FaFilePdf, FaFileCsv, FaFilter, FaCalendarAlt, FaCheck } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { adminRegistrationService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  RegistrationFilters,
  ExportOptions,
  RegistrationStatus,
  ParticipantType,
} from '@/types/admin'

const AdminRegistrationsExportPage: React.FC = () => {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filtros de exportación
  const [filters, setFilters] = useState<RegistrationFilters>({})
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeCustomFields: true,
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
      to: new Date(),
    },
  })

  // Campos disponibles para exportación
  const [availableFields] = useState([
    { key: 'registrationCode', label: 'Código de Registro', default: true },
    { key: 'firstName', label: 'Nombre', default: true },
    { key: 'lastName', label: 'Apellidos', default: true },
    { key: 'fullName', label: 'Nombre Completo', default: true },
    { key: 'email', label: 'Email', default: true },
    { key: 'phone', label: 'Teléfono', default: true },
    { key: 'nit', label: 'NIT', default: true },
    { key: 'cui', label: 'CUI', default: true },
    { key: 'companyName', label: 'Empresa', default: true },
    { key: 'position', label: 'Cargo', default: true },
    { key: 'participantType', label: 'Tipo de Participante', default: true },
    { key: 'status', label: 'Estado', default: true },
    { key: 'registrationDate', label: 'Fecha de Registro', default: true },
    { key: 'paymentDate', label: 'Fecha de Pago', default: true },
    { key: 'totalAmount', label: 'Monto Total', default: true },
    { key: 'discountAmount', label: 'Descuento', default: true },
    { key: 'finalPrice', label: 'Precio Final', default: true },
    { key: 'eventTitle', label: 'Título del Evento', default: true },
    { key: 'customFields', label: 'Campos Personalizados', default: false },
  ])

  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableFields.filter(f => f.default).map(f => f.key)
  )

  // Manejar cambios en filtros
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  // Manejar cambios en opciones de exportación
  const handleExportOptionChange = (field: string, value: any) => {
    setExportOptions(prev => ({ ...prev, [field]: value }))
  }

  // Manejar selección de campos
  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    setSelectedFields(prev =>
      checked
        ? [...prev, fieldKey]
        : prev.filter(f => f !== fieldKey)
    )
  }

  // Seleccionar todos los campos
  const handleSelectAllFields = (checked: boolean) => {
    setSelectedFields(checked ? availableFields.map(f => f.key) : [])
  }

  // Validar formulario
  const validateForm = () => {
    if (!exportOptions.format) return 'Selecciona un formato de exportación'
    if (selectedFields.length === 0) return 'Selecciona al menos un campo para exportar'
    if (exportOptions.dateRange?.from && exportOptions.dateRange?.to &&
        exportOptions.dateRange.from > exportOptions.dateRange.to) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin'
    }
    return null
  }

  // Iniciar exportación
  const handleExport = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setExporting(true)
      setError(null)
      setSuccess(null)

      const exportData: ExportOptions = {
        ...exportOptions,
        fields: selectedFields,
        filters: filters,
      }

      const blob = await adminRegistrationService.exportRegistrations(
        exportOptions.format,
        filters,
        exportData
      )

      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Nombre del archivo con timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const extension = exportOptions.format === 'excel' ? 'xlsx' :
                       exportOptions.format === 'pdf' ? 'pdf' : 'csv'
      link.download = `inscripciones_${timestamp}.${extension}`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccess(`Exportación completada. Archivo descargado: inscripciones_${timestamp}.${extension}`)
    } catch (err) {
      console.error('Error exportando inscripciones:', err)
      setError('Error al exportar las inscripciones')
    } finally {
      setExporting(false)
    }
  }

  // Obtener icono del formato
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'excel': return <FaFileExcel className="h-5 w-5 text-green-600" />
      case 'pdf': return <FaFilePdf className="h-5 w-5 text-red-600" />
      case 'csv': return <FaFileCsv className="h-5 w-5 text-blue-600" />
      default: return <FaDownload className="h-5 w-5 text-gray-600" />
    }
  }

  // Obtener nombre del formato
  const getFormatName = (format: string) => {
    switch (format) {
      case 'excel': return 'Excel (.xlsx)'
      case 'pdf': return 'PDF (.pdf)'
      case 'csv': return 'CSV (.csv)'
      default: return format
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Inscripciones', href: '/admin/inscripciones' },
    { label: 'Exportar' },
  ]

  return (
    <AdminLayout title="Exportar Inscripciones" breadcrumbs={breadcrumbs}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <FaArrowLeft className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Exportar Inscripciones</h1>
              <p className="text-gray-600">Exporta los datos de inscripciones en diferentes formatos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filtros */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaFilter className="mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estado */}
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-2 space-y-2">
                    {(['BORRADOR', 'PENDIENTE_PAGO', 'PAGADO', 'CONFIRMADO', 'CANCELADO', 'EXPIRADO', 'REEMBOLSADO'] as RegistrationStatus[]).map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status?.includes(status) || false}
                          onCheckedChange={(checked) => {
                            const currentStatuses = filters.status || []
                            const newStatuses = checked
                              ? [...currentStatuses, status]
                              : currentStatuses.filter(s => s !== status)
                            handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined)
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm">
                          {status.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tipo de participante */}
                <div>
                  <Label className="text-sm font-medium">Tipo de Participante</Label>
                  <div className="mt-2 space-y-2">
                    {(['individual', 'empresa'] as ParticipantType[]).map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.participantType?.includes(type) || false}
                          onCheckedChange={(checked) => {
                            const currentTypes = filters.participantType || []
                            const newTypes = checked
                              ? [...currentTypes, type]
                              : currentTypes.filter(t => t !== type)
                            handleFilterChange('participantType', newTypes.length > 0 ? newTypes : undefined)
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rango de fechas */}
                <div>
                  <Label className="text-sm font-medium">Rango de Fechas</Label>
                  <div className="mt-2 space-y-2">
                    <div>
                      <Label htmlFor="dateFrom" className="text-xs">Desde</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={exportOptions.dateRange?.from?.toISOString().split('T')[0] || ''}
                        onChange={(e) => handleExportOptionChange('dateRange', {
                          ...exportOptions.dateRange,
                          from: e.target.value ? new Date(e.target.value) : undefined
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateTo" className="text-xs">Hasta</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={exportOptions.dateRange?.to?.toISOString().split('T')[0] || ''}
                        onChange={(e) => handleExportOptionChange('dateRange', {
                          ...exportOptions.dateRange,
                          to: e.target.value ? new Date(e.target.value) : undefined
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Búsqueda */}
                <div>
                  <Label htmlFor="search" className="text-sm font-medium">Búsqueda</Label>
                  <Input
                    id="search"
                    placeholder="Buscar por nombre, email..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opciones de exportación */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formato */}
            <Card>
              <CardHeader>
                <CardTitle>Formato de Exportación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'excel', label: 'Excel' },
                    { value: 'pdf', label: 'PDF' },
                    { value: 'csv', label: 'CSV' }
                  ].map((format) => (
                    <div
                      key={format.value}
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        exportOptions.format === format.value ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleExportOptionChange('format', format.value)}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={exportOptions.format === format.value}
                        onChange={() => {}}
                        className="text-blue-600"
                      />
                      <label className="flex items-center cursor-pointer">
                        {getFormatIcon(format.value)}
                        <span className="ml-2 font-medium">{format.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campos a incluir */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Campos a Incluir</span>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedFields.length === availableFields.length}
                      onCheckedChange={handleSelectAllFields}
                    />
                    <Label htmlFor="selectAll" className="text-sm">Seleccionar todos</Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableFields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`field-${field.key}`}
                        checked={selectedFields.includes(field.key)}
                        onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                      />
                      <Label htmlFor={`field-${field.key}`} className="text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Opciones adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Opciones Adicionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCustomFields"
                    checked={exportOptions.includeCustomFields || false}
                    onCheckedChange={(checked) => handleExportOptionChange('includeCustomFields', checked)}
                  />
                  <Label htmlFor="includeCustomFields" className="text-sm">
                    Incluir campos personalizados
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Vista previa y estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Formato:</span>
                    <Badge variant="outline" className="flex items-center">
                      {getFormatIcon(exportOptions.format)}
                      <span className="ml-1">{getFormatName(exportOptions.format)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Campos seleccionados:</span>
                    <span className="text-sm text-gray-600">{selectedFields.length} de {availableFields.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rango de fechas:</span>
                    <span className="text-sm text-gray-600">
                      {exportOptions.dateRange?.from?.toLocaleDateString()} - {exportOptions.dateRange?.to?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mensajes de error y éxito */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {success && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <p className="text-green-700">{success}</p>
                </CardContent>
              </Card>
            )}

            {/* Botón de exportación */}
            <div className="flex justify-end">
              <Button onClick={handleExport} disabled={exporting} size="lg">
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Exportando...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" />
                    Exportar Inscripciones
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminRegistrationsExportPage