import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaCertificate,
  FaDownload,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { UserService, UserProfile } from '@/services/userService'
import DashboardSidebar from '@/components/ui/dashboard-sidebar'
import DashboardHeader from '@/components/ui/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Certificate {
  id: number
  title: string
  eventTitle: string
  issueDate: string
  duration: string
  verificationCode: string
  status: 'issued' | 'pending' | 'expired'
  downloadUrl?: string
  previewUrl?: string
  instructor?: string
  modality?: string
  location?: string
}

const DashboardCertificatesPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadCertificatesData()
    }
  }, [isAuthenticated])

  const loadCertificatesData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener perfil del usuario
      const profile = await UserService.getProfile()
      setUserProfile(profile)

      // Mock data - será reemplazado con llamadas a la API reales
      setCertificates([
        {
          id: 1,
          title: 'Certificado de Participación',
          eventTitle: 'Taller de Finanzas Personales',
          issueDate: '2023-08-20',
          duration: '16 horas',
          verificationCode: 'TC-CERT-2023-ABCD1234',
          status: 'issued',
          instructor: 'Ana Martínez',
          modality: 'virtual',
          location: 'Plataforma Zoom'
        },
        {
          id: 2,
          title: 'Certificado de Participación',
          eventTitle: 'Conferencia de Tecnología',
          issueDate: '2023-07-25',
          duration: '8 horas',
          verificationCode: 'TC-CERT-2023-EFGH5678',
          status: 'issued',
          instructor: 'Dr. Roberto Sánchez',
          modality: 'presencial',
          location: 'Hotel Marriott, Ciudad de Guatemala'
        },
        {
          id: 3,
          title: 'Certificado de Aprobación',
          eventTitle: 'Curso de Ventas',
          issueDate: '2023-06-15',
          duration: '24 horas',
          verificationCode: 'TC-CERT-2023-IJKL9012',
          status: 'issued',
          instructor: 'Luis Hernández',
          modality: 'virtual',
          location: 'Plataforma de e-learning'
        }
      ])
    } catch (err) {
      console.error('Error loading certificates data:', err)
      setError(err instanceof Error ? err.message : 'Error cargando certificados')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'Emitido'
      case 'pending': return 'Pendiente'
      case 'expired': return 'Expirado'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'expired': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'Virtual'
      case 'presencial': return 'Presencial'
      case 'hibrido': return 'Híbrido'
      default: return modality
    }
  }

  const handleDownloadCertificate = (certificate: Certificate) => {
    // Simular descarga - en producción esto llamaría a la API
    console.log('Descargando certificado:', certificate.id)
    // window.open(certificate.downloadUrl, '_blank')
  }

  const handleViewCertificate = (certificate: Certificate) => {
    // Simular vista previa - en producción esto abriría un modal o nueva ventana
    console.log('Viendo certificado:', certificate.id)
    // window.open(certificate.previewUrl, '_blank')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder al dashboard.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Cargando...</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22]"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Bienvenido, {user?.name}</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50">
            <FaExclamationTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button
                onClick={loadCertificatesData}
                variant="outline"
                size="sm"
                className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {UserService.getFullName(userProfile)}</span>
              <Button
                onClick={logout}
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <DashboardHeader
              title="Mis Certificados"
              subtitle="Certificados obtenidos por completar eventos y cursos"
            />

            {/* Estadísticas de Certificados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Certificados</CardTitle>
                  <FaCertificate className="h-4 w-4 text-[#6B1E22]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#6B1E22]">{certificates.length}</div>
                  <p className="text-xs text-gray-500">Certificados obtenidos</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Certificados Este Año</CardTitle>
                  <FaCalendarAlt className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {certificates.filter(cert => new Date(cert.issueDate).getFullYear() === 2023).length}
                  </div>
                  <p className="text-xs text-gray-500">En 2023</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Horas Totales</CardTitle>
                  <FaClock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {certificates.reduce((total, cert) => {
                      const hours = parseInt(cert.duration.split(' ')[0])
                      return total + (isNaN(hours) ? 0 : hours)
                    }, 0)}
                  </div>
                  <p className="text-xs text-gray-500">Horas de formación</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lista de Certificados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {certificates.map((certificate, index) => (
                <motion.div
                  key={certificate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{certificate.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{certificate.eventTitle}</p>
                        </div>
                        <Badge variant="secondary" className={`capitalize ${getStatusColor(certificate.status)}`}>
                          {getStatusText(certificate.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Fecha de Emisión:</strong><br />
                          {formatDate(certificate.issueDate)}
                        </div>
                        <div>
                          <strong>Duración:</strong><br />
                          {certificate.duration}
                        </div>
                        <div>
                          <strong>Código de Verificación:</strong><br />
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {certificate.verificationCode}
                          </code>
                        </div>
                      </div>

                      {(certificate.instructor || certificate.modality || certificate.location) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            {certificate.instructor && (
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-600" />
                                <span><strong>Instructor:</strong> {certificate.instructor}</span>
                              </div>
                            )}
                            {certificate.modality && (
                              <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-blue-600" />
                                <span><strong>Modalidad:</strong> {getModalityText(certificate.modality)}</span>
                              </div>
                            )}
                            {certificate.location && (
                              <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-purple-600" />
                                <span><strong>Lugar:</strong> {certificate.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleViewCertificate(certificate)}
                      variant="outline"
                      className="flex-1"
                    >
                      <FaEye className="mr-2" />
                      Ver Detalles
                    </Button>
                    <Button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
                    >
                      <FaDownload className="mr-2" />
                      Descargar PDF
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {certificates.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <FaCertificate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay certificados</h3>
                <p className="text-gray-600 mb-4">Aún no has obtenido ningún certificado.</p>
                <p className="text-sm text-gray-500 mb-6">
                  Completa eventos y cursos para obtener tus certificados oficiales.
                </p>
                <Link to="/events">
                  <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                    Explorar Eventos Disponibles
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Información de Verificación */}
            {certificates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
              >
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Verificación de Certificados</h3>
                    <p className="text-blue-800 mb-3">
                      Puedes verificar la autenticidad de tus certificados utilizando nuestro sistema de verificación público.
                      Cada certificado incluye un código único de verificación.
                    </p>
                    <Link to="/verify">
                      <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        Ir al Verificador
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardCertificatesPage