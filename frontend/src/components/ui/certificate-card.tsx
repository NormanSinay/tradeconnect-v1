import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FaCertificate, FaDownload, FaEye, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa'

interface CertificateCardProps {
  id: number
  title: string
  eventName: string
  issueDate: string
  verificationCode: string
  duration: string
  status: 'issued' | 'pending' | 'expired'
  downloadUrl?: string
  onViewDetails?: () => void
  onDownload?: () => void
  className?: string
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  title,
  eventName,
  issueDate,
  verificationCode,
  duration,
  status,
  downloadUrl,
  onViewDetails,
  onDownload,
  className = ''
}) => {
  const getStatusBadge = () => {
    const statusConfig = {
      issued: {
        label: 'Emitido',
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800',
        icon: FaCheckCircle
      },
      pending: {
        label: 'Pendiente',
        variant: 'secondary' as const,
        color: 'bg-yellow-100 text-yellow-800',
        icon: FaClock
      },
      expired: {
        label: 'Expirado',
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800',
        icon: FaExclamationTriangle
      },
    }

    const config = statusConfig[status]
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6B1E22]/10 rounded-lg">
                <FaCertificate className="h-6 w-6 text-[#6B1E22]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {eventName}
                </p>
              </div>
            </div>
            <div className="ml-3">
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Fecha de Emisión
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatDate(issueDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Duración
                </p>
                <p className="text-sm text-gray-900">
                  {duration}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Código de Verificación
                </p>
                <p className="text-xs text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                  {verificationCode}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Verificación:</strong> Puedes verificar la autenticidad de este certificado
              utilizando nuestro <a href="/verify" className="underline hover:no-underline">sistema de verificación público</a>.
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t border-gray-100">
          <div className="flex gap-2 w-full">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="flex-1"
              >
                <FaEye className="mr-2 h-4 w-4" />
                Ver Detalles
              </Button>
            )}

            {onDownload && status === 'issued' && downloadUrl && (
              <Button
                size="sm"
                onClick={onDownload}
                className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
              >
                <FaDownload className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            )}

            {status === 'pending' && (
              <div className="flex-1 text-center py-2">
                <span className="text-sm text-gray-500">Certificado en proceso de emisión</span>
              </div>
            )}

            {status === 'expired' && (
              <div className="flex-1 text-center py-2">
                <span className="text-sm text-red-600">Certificado expirado</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default CertificateCard