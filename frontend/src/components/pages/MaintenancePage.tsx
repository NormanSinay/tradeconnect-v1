import React from 'react'
import { FaTools } from 'react-icons/fa'

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaTools className="mx-auto h-16 w-16 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Mantenimiento en Progreso
        </h1>
        <p className="text-gray-600 mb-6">
          Estamos realizando mantenimiento programado en nuestros servidores. El servicio estará disponible nuevamente en breve.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Verificar Estado
          </button>
          <a
            href="mailto:soporte@tradeconnect.com"
            className="inline-block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Contactar Soporte
          </a>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          Disculpe las molestias
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage