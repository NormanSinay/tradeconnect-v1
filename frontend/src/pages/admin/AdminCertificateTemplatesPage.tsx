import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaCopy, FaDownload, FaUpload, FaPalette, FaFileCode, FaCheckCircle, FaTimesCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { adminCertificateService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  CertificateTemplateAttributes,
  CertificateTemplateConfiguration,
  AdminPaginatedResponse,
} from '@/types/admin'

const AdminCertificateTemplatesPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<CertificateTemplateAttributes[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({
    search: '',
    eventType: '',
    active: '' as 'true' | 'false' | '',
  })
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplateAttributes | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [newTemplate, setNewTemplate] = useState<Partial<CertificateTemplateAttributes>>({
    name: '',
    eventTypes: [],
    active: true,
    version: '1.0.0',
    htmlTemplate: '',
    cssStyles: '',
    requiredVariables: [],
    configuration: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      fonts: { primary: 'Arial' },
      qrCode: { size: 100, position: 'bottom-right' },
    },
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#cccccc',
  })
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadTemplates()
  }, [filters, pagination.page])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response: AdminPaginatedResponse<CertificateTemplateAttributes> = await adminCertificateService.getCertificateTemplates(
        {
          eventType: filters.eventType || undefined,
          active: filters.active ? filters.active === 'true' : undefined,
        },
        { page: pagination.page, limit: pagination.limit }
      )

      setTemplates(response.data)
      setPagination(prev => ({ ...prev, total: response.total }))

    } catch (err: any) {
      console.error('Error cargando plantillas:', err)
      setError('Error al cargar las plantillas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      setError(null)
      await adminCertificateService.createCertificateTemplate(newTemplate as Omit<CertificateTemplateAttributes, 'id' | 'createdAt' | 'updatedAt'>)
      setShowCreateDialog(false)
      setNewTemplate({
        name: '',
        eventTypes: [],
        active: true,
        version: '1.0.0',
        htmlTemplate: '',
        cssStyles: '',
        requiredVariables: [],
        configuration: {
          orientation: 'portrait',
          pageSize: 'A4',
          margins: { top: 20, bottom: 20, left: 20, right: 20 },
          fonts: { primary: 'Arial' },
          qrCode: { size: 100, position: 'bottom-right' },
        },
        backgroundColor: '#ffffff',
        textColor: '#000000',
        borderColor: '#cccccc',
      })
      await loadTemplates()
    } catch (err: any) {
      console.error('Error creando plantilla:', err)
      setError('Error al crear la plantilla')
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return

    try {
      setError(null)
      await adminCertificateService.updateCertificateTemplate(selectedTemplate.id, selectedTemplate)
      setShowEditDialog(false)
      setSelectedTemplate(null)
      await loadTemplates()
    } catch (err: any) {
      console.error('Error actualizando plantilla:', err)
      setError('Error al actualizar la plantilla')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('¿Está seguro de eliminar esta plantilla? Esta acción no se puede deshacer.')) return

    try {
      await adminCertificateService.deleteCertificateTemplate(templateId)
      await loadTemplates()
    } catch (err: any) {
      console.error('Error eliminando plantilla:', err)
      setError('Error al eliminar la plantilla')
    }
  }

  const handlePreviewTemplate = async (template: CertificateTemplateAttributes) => {
    try {
      const result = await adminCertificateService.previewCertificateTemplate(template.id)
      setPreviewHtml(result.html)
      setSelectedTemplate(template)
      setShowPreviewDialog(true)
    } catch (err: any) {
      console.error('Error previsualizando plantilla:', err)
      setError('Error al previsualizar la plantilla')
    }
  }

  const handleDuplicateTemplate = async (template: CertificateTemplateAttributes) => {
    const duplicatedTemplate = {
      ...template,
      id: undefined,
      name: `${template.name} (Copia)`,
      createdAt: undefined,
      updatedAt: undefined,
    }
    setNewTemplate(duplicatedTemplate)
    setShowCreateDialog(true)
  }

  const handleExportTemplates = async (format: 'json' | 'zip') => {
    try {
      const blob = await adminCertificateService.exportCertificateTemplates(format, {
        eventType: filters.eventType || undefined,
        active: filters.active ? filters.active === 'true' : undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-templates.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Error exportando plantillas:', err)
      setError('Error al exportar las plantillas')
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Certificados', href: '/admin/certificados' },
    { label: 'Plantillas' },
  ]

  return (
    <AdminLayout title="Plantillas de Certificados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Plantillas de Certificados</h1>
            <p className="text-gray-600 mt-1">
              Gestión de plantillas personalizables para certificados
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleExportTemplates('json')}>
              <FaDownload className="mr-2" />
              Exportar JSON
            </Button>
            <Button variant="outline" onClick={() => handleExportTemplates('zip')}>
              <FaDownload className="mr-2" />
              Exportar ZIP
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FaPlus className="mr-2" />
                  Nueva Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Plantilla</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="design">Diseño</TabsTrigger>
                      <TabsTrigger value="content">Contenido</TabsTrigger>
                      <TabsTrigger value="config">Configuración</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nombre</label>
                          <Input
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nombre de la plantilla"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Versión</label>
                          <Input
                            value={newTemplate.version}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, version: e.target.value }))}
                            placeholder="1.0.0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tipos de Evento</label>
                          <Select
                            value={newTemplate.eventTypes?.[0] || ''}
                            onValueChange={(value) => setNewTemplate(prev => ({
                              ...prev,
                              eventTypes: value ? [value] : []
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conference">Conferencia</SelectItem>
                              <SelectItem value="workshop">Taller</SelectItem>
                              <SelectItem value="seminar">Seminario</SelectItem>
                              <SelectItem value="course">Curso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newTemplate.active}
                            onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, active: checked }))}
                          />
                          <label className="text-sm font-medium">Activa</label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="design" className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Color de Fondo</label>
                          <Input
                            type="color"
                            value={newTemplate.backgroundColor}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Color de Texto</label>
                          <Input
                            type="color"
                            value={newTemplate.textColor}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, textColor: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Color de Borde</label>
                          <Input
                            type="color"
                            value={newTemplate.borderColor}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, borderColor: e.target.value }))}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Plantilla HTML</label>
                        <Textarea
                          value={newTemplate.htmlTemplate}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, htmlTemplate: e.target.value }))}
                          placeholder="<div class='certificate'>...</div>"
                          rows={10}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Estilos CSS</label>
                        <Textarea
                          value={newTemplate.cssStyles}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, cssStyles: e.target.value }))}
                          placeholder=".certificate { ... }"
                          rows={8}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="config" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Orientación</label>
                          <Select
                            value={newTemplate.configuration?.orientation}
                            onValueChange={(value: 'portrait' | 'landscape') =>
                              setNewTemplate(prev => ({
                                ...prev,
                                configuration: { ...prev.configuration!, orientation: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Vertical</SelectItem>
                              <SelectItem value="landscape">Horizontal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tamaño de Página</label>
                          <Select
                            value={newTemplate.configuration?.pageSize}
                            onValueChange={(value: 'A4' | 'A3' | 'Letter') =>
                              setNewTemplate(prev => ({
                                ...prev,
                                configuration: { ...prev.configuration!, pageSize: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A3">A3</SelectItem>
                              <SelectItem value="Letter">Carta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Crear Plantilla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Buscar por nombre..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <Select value={filters.eventType} onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="conference">Conferencia</SelectItem>
                    <SelectItem value="workshop">Taller</SelectItem>
                    <SelectItem value="seminar">Seminario</SelectItem>
                    <SelectItem value="course">Curso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.active} onValueChange={(value) => setFilters(prev => ({ ...prev, active: value as 'true' | 'false' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="true">Activos</SelectItem>
                    <SelectItem value="false">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={loadTemplates}>
                  <FaSearch className="mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" onClick={() => setFilters({ search: '', eventType: '', active: '' })}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de plantillas */}
        <Card>
          <CardHeader>
            <CardTitle>Plantillas ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Tipos de Evento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.eventTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.active ? 'default' : 'secondary'}>
                        {template.active ? (
                          <>
                            <FaCheckCircle className="mr-1" />
                            Activa
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-1" />
                            Inactiva
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(template.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <FaEye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowEditDialog(true)
                          }}
                        >
                          <FaEdit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <FaCopy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <FaTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {templates.length === 0 && !loading && (
              <div className="text-center py-8">
                <FaFileCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron plantillas
                </h3>
                <p className="text-gray-600">
                  Crea tu primera plantilla de certificado para comenzar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de previsualización */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Previsualización de Plantilla</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="certificate-preview"
                  style={{
                    maxWidth: '100%',
                    overflow: 'hidden',
                    backgroundColor: selectedTemplate?.backgroundColor || '#ffffff',
                    color: selectedTemplate?.textColor || '#000000',
                    border: `1px solid ${selectedTemplate?.borderColor || '#cccccc'}`,
                    padding: '20px',
                  }}
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimesCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCertificateTemplatesPage