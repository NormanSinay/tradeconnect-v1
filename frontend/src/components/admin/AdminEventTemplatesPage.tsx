import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCopy, FaEye, FaDownload } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminEventService } from '@/services/admin'
import type { EventTemplateInfo } from '@/types/admin'

const AdminEventTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EventTemplateInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])

  // Cargar templates
  useEffect(() => {
    loadTemplates()
    return
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Implementar servicio para obtener templates
      // const templatesData = await adminEventService.getEventTemplates()
      // setTemplates(templatesData)

      // Mock data por ahora
      setTemplates([
        {
          id: 1,
          name: 'Conferencia Técnica',
          description: 'Template para conferencias técnicas con sesiones paralelas',
          isPublic: true,
          usageCount: 15,
          createdBy: 1,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 2,
          name: 'Taller Práctico',
          description: 'Template para talleres prácticos con ejercicios',
          isPublic: true,
          usageCount: 8,
          createdBy: 1,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
      ])
    } catch (err) {
      console.error('Error cargando templates:', err)
      setError('Error al cargar los templates')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar templates
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar selección
  const handleSelectTemplate = (templateId: number, checked: boolean) => {
    setSelectedTemplates(prev =>
      checked
        ? [...prev, templateId]
        : prev.filter(id => id !== templateId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedTemplates(checked ? templates.map(t => t.id) : [])
  }

  // Acciones
  const handleCreateTemplate = () => {
    // TODO: Navigate to create template page
    console.log('Create template')
  }

  const handleEditTemplate = (template: EventTemplateInfo) => {
    // TODO: Navigate to edit template page
    console.log('Edit template:', template)
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este template?')) return

    try {
      // TODO: Implementar eliminación
      // await adminEventService.deleteEventTemplate(templateId)
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    } catch (err) {
      console.error('Error eliminando template:', err)
      setError('Error al eliminar el template')
    }
  }

  const handleUseTemplate = (template: EventTemplateInfo) => {
    // TODO: Navigate to create event with template
    console.log('Use template:', template)
  }

  const handleExportTemplate = async (template: EventTemplateInfo) => {
    try {
      // TODO: Implementar exportación
      console.log('Export template:', template)
    } catch (err) {
      console.error('Error exportando template:', err)
      setError('Error al exportar el template')
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: 'Templates' },
  ]

  return (
    <AdminLayout title="Templates de Eventos" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Templates de Eventos</h1>
            <p className="text-gray-600">Gestiona plantillas reutilizables para crear eventos</p>
          </div>
          <Button onClick={handleCreateTemplate}>
            <FaPlus className="mr-2" />
            Nuevo Template
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedTemplates.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedTemplates.length} template{selectedTemplates.length > 1 ? 's' : ''} seleccionado{selectedTemplates.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <FaDownload className="mr-2" />
                    Exportar
                  </Button>
                  <Button variant="destructive" size="sm">
                    <FaTrash className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de templates */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-12 text-center">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron templates
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay templates registrados.'}
                </p>
                <Button onClick={handleCreateTemplate}>
                  <FaPlus className="mr-2" />
                  Crear primer template
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedTemplates.includes(template.id)}
                          onChange={(e) => handleSelectTemplate(template.id, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {template.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{template.usageCount}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isPublic ? 'default' : 'secondary'}>
                          {template.isPublic ? 'Público' : 'Privado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FaEdit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                              <FaCopy className="mr-2" />
                              Usar Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                              <FaDownload className="mr-2" />
                              Exportar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600"
                            >
                              <FaTrash className="mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
      </div>
    </AdminLayout>
  )
}

export default AdminEventTemplatesPage