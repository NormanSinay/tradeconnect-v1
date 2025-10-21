import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaStar, FaComments, FaUser } from 'react-icons/fa'
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
  SpeakerEvaluationInfo,
  SpeakerEvaluationStats,
  EvaluatorType,
} from '@/types/admin'

interface AdminSpeakerEvaluationsPageProps {
  speakerId: number
}

const AdminSpeakerEvaluationsPage: React.FC<AdminSpeakerEvaluationsPageProps> = ({ speakerId }) => {
  const [evaluations, setEvaluations] = useState<SpeakerEvaluationInfo[]>([])
  const [stats, setStats] = useState<SpeakerEvaluationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvaluations, setSelectedEvaluations] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<{ evaluatorType?: EvaluatorType; eventId?: number }>({})
  const [speaker, setSpeaker] = useState<{ id: number; fullName: string } | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadEvaluations()
    loadStats()
    loadSpeaker()
  }, [speakerId, filters, searchTerm])

  // Cargar evaluaciones
  const loadEvaluations = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await adminSpeakerService.getSpeakerEvaluations(speakerId, filters)
      setEvaluations(result)
    } catch (err) {
      console.error('Error cargando evaluaciones:', err)
      setError('Error al cargar las evaluaciones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const data = await adminSpeakerService.getSpeakerEvaluationStats(speakerId)
      setStats(data)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  // Cargar información del speaker
  const loadSpeaker = async () => {
    try {
      const speakerData = await adminSpeakerService.getSpeakerById(speakerId)
      setSpeaker({ id: speakerData.id, fullName: speakerData.fullName })
    } catch (error) {
      console.error('Error cargando speaker:', error)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  // Manejar filtros
  const handleFilterChange = (newFilters: Partial<{ evaluatorType?: EvaluatorType; eventId?: number }>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Manejar selección de evaluaciones
  const handleSelectEvaluation = (evaluationId: number, checked: boolean) => {
    setSelectedEvaluations(prev =>
      checked
        ? [...prev, evaluationId]
        : prev.filter(id => id !== evaluationId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedEvaluations(checked ? evaluations.map(e => e.id) : [])
  }

  // Acciones individuales
  const handleViewEvaluation = (evaluation: SpeakerEvaluationInfo) => {
    // TODO: Navigate to evaluation detail
    console.log('View evaluation:', evaluation)
  }

  const handleEditEvaluation = (evaluation: SpeakerEvaluationInfo) => {
    // TODO: Navigate to edit evaluation
    console.log('Edit evaluation:', evaluation)
  }

  const handleDeleteEvaluation = async (evaluationId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evaluación?')) return

    try {
      // TODO: Implement delete evaluation method
      console.log('Delete evaluation:', evaluationId)
      loadEvaluations()
      loadStats()
    } catch (err) {
      console.error('Error eliminando evaluación:', err)
      setError('Error al eliminar la evaluación')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedEvaluations.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedEvaluations.length} evaluaciones?`)) return

    try {
      // TODO: Implement bulk delete
      setSelectedEvaluations([])
      loadEvaluations()
      loadStats()
    } catch (err) {
      console.error('Error eliminando evaluaciones:', err)
      setError('Error al eliminar las evaluaciones')
    }
  }

  const handleBulkExport = async () => {
    try {
      // TODO: Implement export evaluations
      console.log('Export evaluations')
    } catch (err) {
      console.error('Error exportando evaluaciones:', err)
      setError('Error al exportar las evaluaciones')
    }
  }

  // Obtener texto de tipo de evaluador
  const getEvaluatorTypeText = (type: EvaluatorType) => {
    const texts: Record<EvaluatorType, string> = {
      organizer: 'Organizador',
      attendee: 'Asistente',
      both: 'Ambos',
    }
    return texts[type] || type
  }

  // Renderizar estrellas de rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`inline-block ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Speakers', href: '/admin/speakers' },
    { label: speaker?.fullName || 'Speaker', href: `/admin/speakers/${speakerId}/editar` },
    { label: 'Evaluaciones' },
  ]

  return (
    <AdminLayout title={`Evaluaciones - ${speaker?.fullName || 'Speaker'}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Evaluaciones de {speaker?.fullName}</h1>
            <p className="text-gray-600">Gestiona todas las evaluaciones del speaker</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create evaluation */}}>
              <FaPlus className="mr-2" />
              Nueva Evaluación
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FaComments className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                    <p className="text-2xl font-bold">{stats.totalEvaluations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FaStar className="h-8 w-8 text-yellow-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FaUser className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Última Evaluación</p>
                    <p className="text-2xl font-bold">
                      {stats.lastEvaluationDate
                        ? formatDateTime(stats.lastEvaluationDate).split(' ')[0]
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Distribución</p>
                    <div className="text-xs text-gray-500">
                      {Object.entries(stats.ratingDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([rating, count]) => `${rating}★: ${count}`)
                        .join(', ')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar evaluaciones..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.evaluatorType || ''}
                  onChange={(e) => handleFilterChange({
                    evaluatorType: e.target.value as EvaluatorType || undefined
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="organizer">Organizador</option>
                  <option value="attendee">Asistente</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedEvaluations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedEvaluations.length} evaluación{selectedEvaluations.length > 1 ? 'es' : ''} seleccionada{selectedEvaluations.length > 1 ? 's' : ''}
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

        {/* Tabla de evaluaciones */}
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
            ) : evaluations.length === 0 ? (
              <div className="p-12 text-center">
                <FaComments className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron evaluaciones
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay evaluaciones registradas para este speaker.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primera evaluación
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedEvaluations.length === evaluations.length && evaluations.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Evaluador</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comentarios</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Público</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEvaluations.includes(evaluation.id)}
                          onCheckedChange={(checked) => handleSelectEvaluation(evaluation.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{evaluation.eventTitle}</div>
                          <div className="text-sm text-gray-500">
                            ID: {evaluation.eventId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEvaluatorTypeText(evaluation.evaluatorType)}
                        </Badge>
                        {evaluation.evaluatorId && (
                          <div className="text-sm text-gray-500 mt-1">
                            ID: {evaluation.evaluatorId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {renderStars(evaluation.overallRating)}
                          </div>
                          <span className="font-medium">{evaluation.overallRating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {evaluation.comments || 'Sin comentarios'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDateTime(evaluation.evaluationDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={evaluation.isPublic ? 'default' : 'secondary'}>
                          {evaluation.isPublic ? 'Público' : 'Privado'}
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
                            <DropdownMenuItem onClick={() => handleViewEvaluation(evaluation)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvaluation(evaluation)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteEvaluation(evaluation.id)}
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
                <FaComments className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminSpeakerEvaluationsPage