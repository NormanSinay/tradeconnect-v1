import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaStar, FaFileContract, FaMoneyBillWave, FaComments } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { adminSpeakerService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  PublicSpeaker,
  SpeakerQueryParams,
  SpeakerFilters,
  SpeakerCategory,
  RateType,
  Modality,
} from '@/types/admin'

const AdminSpeakersPage: React.FC = () => {
  const [speakers, setSpeakers] = useState<PublicSpeaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpeakers, setSelectedSpeakers] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SpeakerFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSpeakers, setTotalSpeakers] = useState(0)

  // Cargar datos iniciales
  useEffect(() => {
    loadSpeakers()
  }, [currentPage, filters, searchTerm])

  // Cargar speakers
  const loadSpeakers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: SpeakerQueryParams = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        filters,
      }

      const result = await adminSpeakerService.getSpeakers(params)
      setSpeakers(result.speakers)
      setTotalPages(result.pagination.pages)
      setTotalSpeakers(result.pagination.total)
    } catch (err) {
      console.error('Error cargando speakers:', err)
      setError('Error al cargar los speakers')
    } finally {
      setLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Manejar filtros
  const handleFilterChange = (newFilters: Partial<SpeakerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Manejar selección de speakers
  const handleSelectSpeaker = (speakerId: number, checked: boolean) => {
    setSelectedSpeakers(prev =>
      checked
        ? [...prev, speakerId]
        : prev.filter(id => id !== speakerId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedSpeakers(checked ? speakers.map(s => s.id) : [])
  }

  // Acciones individuales
  const handleViewSpeaker = (speaker: PublicSpeaker) => {
    // TODO: Navigate to speaker detail
    console.log('View speaker:', speaker)
  }

  const handleEditSpeaker = (speaker: PublicSpeaker) => {
    // TODO: Navigate to edit page
    console.log('Edit speaker:', speaker)
  }

  const handleViewContracts = (speaker: PublicSpeaker) => {
    // TODO: Navigate to contracts page
    console.log('View contracts:', speaker)
  }

  const handleViewPayments = (speaker: PublicSpeaker) => {
    // TODO: Navigate to payments page
    console.log('View payments:', speaker)
  }

  const handleViewEvaluations = (speaker: PublicSpeaker) => {
    // TODO: Navigate to evaluations page
    console.log('View evaluations:', speaker)
  }

  const handleDeleteSpeaker = async (speakerId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este speaker?')) return

    try {
      await adminSpeakerService.deleteSpeaker(speakerId)
      loadSpeakers()
    } catch (err) {
      console.error('Error eliminando speaker:', err)
      setError('Error al eliminar el speaker')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedSpeakers.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedSpeakers.length} speakers?`)) return

    try {
      await Promise.all(selectedSpeakers.map(id => adminSpeakerService.deleteSpeaker(id)))
      setSelectedSpeakers([])
      loadSpeakers()
    } catch (err) {
      console.error('Error eliminando speakers:', err)
      setError('Error al eliminar los speakers')
    }
  }

  const handleBulkExport = async () => {
    try {
      const blob = await adminSpeakerService.exportSpeakers('excel', filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `speakers-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando speakers:', err)
      setError('Error al exportar los speakers')
    }
  }

  // Obtener badge de categoría
  const getCategoryBadge = (category: SpeakerCategory) => {
    const variants: Record<SpeakerCategory, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      national: 'default',
      international: 'secondary',
      expert: 'outline',
      special_guest: 'destructive',
    }
    return variants[category] || 'secondary'
  }

  // Obtener texto de categoría
  const getCategoryText = (category: SpeakerCategory) => {
    const texts: Record<SpeakerCategory, string> = {
      national: 'Nacional',
      international: 'Internacional',
      expert: 'Experto',
      special_guest: 'Invitado Especial',
    }
    return texts[category] || category
  }

  // Obtener texto de tarifa
  const getRateTypeText = (rateType: RateType) => {
    const texts: Record<RateType, string> = {
      hourly: 'Por hora',
      daily: 'Por día',
      event: 'Por evento',
    }
    return texts[rateType] || rateType
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Speakers' },
  ]

  return (
    <AdminLayout title="Gestión de Speakers" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Speakers</h1>
            <p className="text-gray-600">Gestiona todos los speakers del sistema</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create */}}>
              <FaPlus className="mr-2" />
              Nuevo Speaker
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar speakers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange({ category: e.target.value as SpeakerCategory || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas las categorías</option>
                  <option value="national">Nacional</option>
                  <option value="international">Internacional</option>
                  <option value="expert">Experto</option>
                  <option value="special_guest">Invitado Especial</option>
                </select>

                <select
                  value={filters.rateType || ''}
                  onChange={(e) => handleFilterChange({ rateType: e.target.value as RateType || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los tipos de tarifa</option>
                  <option value="hourly">Por hora</option>
                  <option value="daily">Por día</option>
                  <option value="event">Por evento</option>
                </select>

                <select
                  value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleFilterChange({
                    isActive: e.target.value === '' ? undefined : e.target.value === 'active'
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedSpeakers.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedSpeakers.length} speaker{selectedSpeakers.length > 1 ? 's' : ''} seleccionado{selectedSpeakers.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <FaDownload className="mr-2" />
                    Exportar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <FaTrash className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de speakers */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : speakers.length === 0 ? (
              <div className="p-12 text-center">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron speakers
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay speakers registrados.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primer speaker
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedSpeakers.length === speakers.length && speakers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead>Tarifa</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {speakers.map((speaker) => (
                    <TableRow key={speaker.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSpeakers.includes(speaker.id)}
                          onCheckedChange={(checked) => handleSelectSpeaker(speaker.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {speaker.profileImage && (
                            <img
                              src={speaker.profileImage}
                              alt={speaker.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{speaker.fullName}</div>
                            <div className="text-sm text-gray-500">{speaker.email}</div>
                            {speaker.country && (
                              <div className="text-sm text-gray-500">{speaker.country}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryBadge(speaker.category)}>
                          {getCategoryText(speaker.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {speaker.specialties.slice(0, 2).map((specialty) => (
                            <Badge key={specialty.id} variant="outline" className="text-xs">
                              {specialty.name}
                            </Badge>
                          ))}
                          {speaker.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{speaker.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {speaker.baseRate} {speaker.rateType === 'hourly' ? 'Q/hora' : speaker.rateType === 'daily' ? 'Q/día' : 'Q/evento'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getRateTypeText(speaker.rateType)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <FaStar className="text-yellow-400" />
                          <span className="font-medium">
                            {speaker.rating ? speaker.rating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{speaker.totalEvents}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={speaker.isActive ? 'default' : 'secondary'}>
                          {speaker.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FaFilter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewSpeaker(speaker)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSpeaker(speaker)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewContracts(speaker)}>
                              <FaFileContract className="mr-2" />
                              Contratos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewPayments(speaker)}>
                              <FaMoneyBillWave className="mr-2" />
                              Pagos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewEvaluations(speaker)}>
                              <FaComments className="mr-2" />
                              Evaluaciones
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteSpeaker(speaker.id)}
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalSpeakers)} de {totalSpeakers} speakers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

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
