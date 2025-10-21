import React, { useState, useEffect } from 'react'
import { FaPlay, FaStop, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaDownload, FaUpload, FaUsers, FaCertificate, FaClock, FaCog } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminCertificateService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  CertificateType,
  GenerateBulkCertificatesRequest,
  CertificateEligibilityCriteria,
} from '@/types/admin'

interface BulkGenerationJob {
  id: string
  eventId: number
  eventTitle: string
  templateId?: string
  certificateType: CertificateType
  totalParticipants: number
  processedParticipants: number
  successfulGenerations: number
  failedGenerations: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startedAt: Date
  completedAt?: Date
  estimatedTimeRemaining?: number
  errors: string[]
  results: {
    certificateId: string
    participantName: string
    status: 'success' | 'failed'
    error?: string
  }[]
}

const AdminCertificateBulkGeneratePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Array<{ id: number; title: string; participantCount: number }>>([])
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([])
  const [currentJob, setCurrentJob] = useState<BulkGenerationJob | null>(null)
  const [jobHistory, setJobHistory] = useState<BulkGenerationJob[]>([])
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<BulkGenerationJob | null>(null)
  const [config, setConfig] = useState({
    eventId: '',
    templateId: '',
    certificateType: 'attendance' as CertificateType,
    eligibilityCriteria: {
      attendancePercentage: 80,
      requiredAttendancePercentage: 75,
    } as CertificateEligibilityCriteria,
    sendEmails: true,
    emailTemplate: '',
    batchSize: 10,
    delayBetweenBatches: 1000,
  })
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadJobHistory()
  }, [])

  // Actualizar progreso del job actual
  useEffect(() => {
    if (currentJob?.status === 'processing') {
      const interval = setInterval(() => {
        // Simular actualización de progreso
        setCurrentJob(prev => {
          if (!prev || prev.status !== 'processing') return prev

          const newProcessed = Math.min(prev.processedParticipants + Math.floor(Math.random() * 3) + 1, prev.totalParticipants)
          const progress = (newProcessed / prev.totalParticipants) * 100

          if (newProcessed >= prev.totalParticipants) {
            return {
              ...prev,
              processedParticipants: prev.totalParticipants,
              successfulGenerations: prev.totalParticipants - Math.floor(Math.random() * 3),
              failedGenerations: Math.floor(Math.random() * 3),
              status: 'completed',
              progress: 100,
              completedAt: new Date(),
            }
          }

          return {
            ...prev,
            processedParticipants: newProcessed,
            progress,
            successfulGenerations: newProcessed - Math.floor(Math.random() * 2),
            failedGenerations: Math.floor(Math.random() * 2),
          }
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [currentJob?.status])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Simular carga de eventos
      const mockEvents = [
        { id: 1, title: 'Conferencia de Tecnología 2024', participantCount: 150 },
        { id: 2, title: 'Workshop de Desarrollo Web', participantCount: 75 },
        { id: 3, title: 'Seminario de IA', participantCount: 200 },
      ]

      // Simular carga de plantillas
      const mockTemplates = [
        { id: 'template-1', name: 'Certificado de Asistencia Estándar' },
        { id: 'template-2', name: 'Certificado de Participación Premium' },
        { id: 'template-3', name: 'Certificado de Logro' },
      ]

      setEvents(mockEvents)
      setTemplates(mockTemplates)

    } catch (err: any) {
      console.error('Error cargando datos iniciales:', err)
      setError('Error al cargar los datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadJobHistory = async () => {
    try {
      // Simular historial de jobs
      const mockHistory: BulkGenerationJob[] = [
        {
          id: 'job-1',
          eventId: 1,
          eventTitle: 'Conferencia de Tecnología 2024',
          templateId: 'template-1',
          certificateType: CertificateType.ATTENDANCE,
          totalParticipants: 150,
          processedParticipants: 150,
          successfulGenerations: 145,
          failedGenerations: 5,
          status: 'completed',
          progress: 100,
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
          errors: ['Error de conexión temporal'],
          results: [],
        },
        {
          id: 'job-2',
          eventId: 2,
          eventTitle: 'Workshop de Desarrollo Web',
          certificateType: 'completion' as CertificateType,
          totalParticipants: 75,
          processedParticipants: 75,
          successfulGenerations: 73,
          failedGenerations: 2,
          status: 'completed',
          progress: 100,
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
          errors: [],
          results: [],
        },
      ]

      setJobHistory(mockHistory)

    } catch (err: any) {
      console.error('Error cargando historial:', err)
    }
  }

  const startBulkGeneration = async () => {
    try {
      setError(null)

      if (!config.eventId) {
        setError('Debe seleccionar un evento')
        return
      }

      const selectedEvent = events.find(e => e.id.toString() === config.eventId)
      if (!selectedEvent) return

      const newJob: BulkGenerationJob = {
        id: `job-${Date.now()}`,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        templateId: config.templateId || undefined,
        certificateType: config.certificateType,
        totalParticipants: selectedEvent.participantCount,
        processedParticipants: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        status: 'processing',
        progress: 0,
        startedAt: new Date(),
        errors: [],
        results: [],
      }

      setCurrentJob(newJob)
      setShowConfigDialog(false)

      // Aquí iría la llamada real al servicio
      // await adminCertificateService.generateBulkCertificates({
      //   eventId: selectedEvent.id,
      //   templateId: config.templateId,
      //   certificateType: config.certificateType,
      //   eligibilityCriteria: config.eligibilityCriteria,
      // })

    } catch (err: any) {
      console.error('Error iniciando generación masiva:', err)
      setError('Error al iniciar la generación masiva')
    }
  }

  const cancelCurrentJob = () => {
    if (currentJob) {
      setCurrentJob(prev => prev ? { ...prev, status: 'cancelled' } : null)
    }
  }

  const exportJobResults = (job: BulkGenerationJob) => {
    // Simular exportación de resultados
    const csvContent = [
      ['Participante', 'Estado', 'Error'].join(','),
      ...job.results.map(r => [r.participantName, r.status, r.error || ''].join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-generation-${job.id}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getStatusBadge = (status: BulkGenerationJob['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'outline',
    } as const

    const icons = {
      pending: <FaClock className="mr-1" />,
      processing: <FaCog className="mr-1 animate-spin" />,
      completed: <FaCheckCircle className="mr-1" />,
      failed: <FaTimesCircle className="mr-1" />,
      cancelled: <FaStop className="mr-1" />,
    }

    return (
      <Badge variant={variants[status]}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Certificados', href: '/admin/certificados' },
    { label: 'Generación Masiva' },
  ]

  return (
    <AdminLayout title="Generación Masiva de Certificados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Generación Masiva de Certificados</h1>
            <p className="text-gray-600 mt-1">
              Proceso automatizado para generar certificados por lote
            </p>
          </div>
          <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
            <DialogTrigger asChild>
              <Button disabled={!!currentJob && currentJob.status === 'processing'}>
                <FaPlay className="mr-2" />
                Nueva Generación Masiva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurar Generación Masiva</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Evento</label>
                    <Select value={config.eventId} onValueChange={(value) => setConfig(prev => ({ ...prev, eventId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.title} ({event.participantCount} participantes)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Plantilla</label>
                    <Select value={config.templateId} onValueChange={(value) => setConfig(prev => ({ ...prev, templateId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Plantilla por defecto</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Certificado</label>
                    <Select value={config.certificateType} onValueChange={(value) => setConfig(prev => ({ ...prev, certificateType: value as CertificateType }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendance">Asistencia</SelectItem>
                        <SelectItem value="completion">Finalización</SelectItem>
                        <SelectItem value="achievement">Logro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Porcentaje Mínimo de Asistencia</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={config.eligibilityCriteria.attendancePercentage}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        eligibilityCriteria: {
                          ...prev.eligibilityCriteria,
                          attendancePercentage: parseInt(e.target.value) || 0
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={config.sendEmails}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, sendEmails: !!checked }))}
                    />
                    <label className="text-sm font-medium">Enviar certificados por email automáticamente</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tamaño del Lote</label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={config.batchSize}
                      onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 10 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Número de certificados a procesar simultáneamente</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Delay entre Lotes (ms)</label>
                    <Input
                      type="number"
                      min="0"
                      max="10000"
                      value={config.delayBetweenBatches}
                      onChange={(e) => setConfig(prev => ({ ...prev, delayBetweenBatches: parseInt(e.target.value) || 1000 }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={startBulkGeneration}>
                    Iniciar Generación
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job actual */}
        {currentJob && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generación en Progreso</span>
                {getStatusBadge(currentJob.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Evento</p>
                    <p className="font-medium">{currentJob.eventTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-medium">{currentJob.certificateType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progreso</p>
                    <p className="font-medium">{currentJob.processedParticipants}/{currentJob.totalParticipants}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Estimado</p>
                    <p className="font-medium">
                      {currentJob.estimatedTimeRemaining
                        ? `${Math.ceil(currentJob.estimatedTimeRemaining / 60)} min restantes`
                        : 'Calculando...'
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso General</span>
                    <span>{Math.round(currentJob.progress)}%</span>
                  </div>
                  <Progress value={currentJob.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{currentJob.successfulGenerations}</p>
                    <p className="text-sm text-gray-600">Exitosos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{currentJob.failedGenerations}</p>
                    <p className="text-sm text-gray-600">Fallidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentJob.totalParticipants - currentJob.processedParticipants}</p>
                    <p className="text-sm text-gray-600">Pendientes</p>
                  </div>
                </div>

                {currentJob.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <FaExclamationTriangle className="text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-700">Errores encontrados:</span>
                    </div>
                    <ul className="text-sm text-red-600 space-y-1">
                      {currentJob.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {currentJob.status === 'processing' && (
                    <Button variant="outline" onClick={cancelCurrentJob}>
                      <FaStop className="mr-2" />
                      Cancelar
                    </Button>
                  )}
                  {currentJob.status === 'completed' && (
                    <Button variant="outline" onClick={() => exportJobResults(currentJob)}>
                      <FaDownload className="mr-2" />
                      Exportar Resultados
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Generaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Exitosos</TableHead>
                  <TableHead>Fallidos</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.eventTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.certificateType}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={job.progress} className="w-16 h-2" />
                        <span className="text-sm">{Math.round(job.progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">{job.successfulGenerations}</TableCell>
                    <TableCell className="text-red-600 font-medium">{job.failedGenerations}</TableCell>
                    <TableCell>{formatDateTime(job.startedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedJob(job)
                            setShowResultsDialog(true)
                          }}
                        >
                          <FaUsers className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportJobResults(job)}
                        >
                          <FaDownload className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {jobHistory.length === 0 && (
              <div className="text-center py-8">
                <FaCertificate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay historial de generaciones
                </h3>
                <p className="text-gray-600">
                  Las generaciones masivas aparecerán aquí cuando se ejecuten.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de resultados detallados */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Resultados de Generación</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Evento</p>
                    <p className="font-medium">{selectedJob.eventTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Certificado</p>
                    <p className="font-medium">{selectedJob.certificateType}</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participante</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedJob.results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.participantName}</TableCell>
                        <TableCell>
                          <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                            {result.status === 'success' ? 'Exitoso' : 'Fallido'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-red-600 text-sm">{result.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowResultsDialog(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
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

export default AdminCertificateBulkGeneratePage