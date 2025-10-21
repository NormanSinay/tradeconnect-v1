import React, { useState, useEffect } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCog } from 'react-icons/fa'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'outage'
  uptime: string
  lastIncident?: string
}

const ServiceStatusPage: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading service status
    const loadServiceStatus = async () => {
      setIsLoading(true)
      // In a real app, this would fetch from an API
      setTimeout(() => {
        setServices([
          { name: 'API Principal', status: 'operational', uptime: '99.9%' },
          { name: 'Base de Datos', status: 'operational', uptime: '99.8%' },
          { name: 'Sistema de Pagos', status: 'operational', uptime: '99.7%' },
          { name: 'Streaming', status: 'operational', uptime: '99.5%' },
          { name: 'Certificados', status: 'operational', uptime: '99.9%' },
          { name: 'Notificaciones', status: 'degraded', uptime: '98.2%', lastIncident: '2025-01-15' },
        ])
        setIsLoading(false)
      }, 1000)
    }

    loadServiceStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
      case 'outage':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />
      default:
        return <FaCog className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'degraded':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'outage':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Estado del Servicio
          </h1>
          <p className="text-gray-600">
            Monitorea el estado de nuestros servicios en tiempo real
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Servicios de TradeConnect
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="px-6 py-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : (
              services.map((service, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        {service.lastIncident && (
                          <p className="text-sm text-gray-500">
                            Último incidente: {service.lastIncident}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                        {service.status === 'operational' && 'Operativo'}
                        {service.status === 'degraded' && 'Degradado'}
                        {service.status === 'outage' && 'Fuera de servicio'}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleString('es-ES')}
          </p>
          <div className="mt-4">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Regresar al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceStatusPage