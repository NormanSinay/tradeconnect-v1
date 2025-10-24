import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/ui/dashboard-layout'
import CertificateCard from '@/components/ui/certificate-card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/userStore'
import { FaCertificate, FaExclamationTriangle, FaSearch } from 'react-icons/fa'

const DashboardCertificatesPage: React.FC = () => {
  const {
    certificates,
    fetchCertificates,
    isLoading,
    error
  } = useUserStore()

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando certificados...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <FaExclamationTriangle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error al cargar los certificados</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={fetchCertificates}
              className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
          <p className="mt-2 text-gray-600">Certificados obtenidos por completar eventos y cursos</p>
        </motion.div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  {...certificate}
                  onViewDetails={() => {
                    // TODO: Implementar modal o página de detalles del certificado
                    console.log('Ver detalles del certificado:', certificate.id)
                  }}
                  onDownload={() => {
                    // TODO: Implementar descarga del certificado
                    console.log('Descargar certificado:', certificate.id)
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center py-12"
          >
            <FaCertificate className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No tienes certificados aún
            </h3>
            <p className="text-gray-600 mb-6">
              Completa eventos y cursos para obtener tus certificados.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard/events">
                <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                  Ver Mis Eventos
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline">
                  Explorar Eventos
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Verification Section */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FaSearch className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Verificación de Certificados
                </h3>
                <p className="text-blue-800 mb-4">
                  Puedes verificar la autenticidad de tus certificados utilizando nuestro sistema de verificación público.
                  Solo necesitas el código de verificación que aparece en cada certificado.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/verify">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <FaSearch className="mr-2 h-4 w-4" />
                      Verificar Certificado
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implementar compartir información de verificación
                      const shareText = `Verifica mis certificados en TradeConnect usando el sistema de verificación público.`
                      if (navigator.share) {
                        navigator.share({ text: shareText })
                      } else {
                        navigator.clipboard.writeText(shareText)
                        // TODO: Mostrar toast de éxito
                      }
                    }}
                  >
                    Compartir Información
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Summary */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Certificaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#6B1E22] mb-1">
                  {certificates.length}
                </div>
                <div className="text-sm text-gray-600">Total de Certificados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {certificates.filter(c => c.status === 'issued').length}
                </div>
                <div className="text-sm text-gray-600">Certificados Emitidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {certificates.reduce((total, cert) => {
                    const hours = parseInt(cert.duration.split(' ')[0]) || 0
                    return total + hours
                  }, 0)}h
                </div>
                <div className="text-sm text-gray-600">Horas de Formación</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DashboardCertificatesPage