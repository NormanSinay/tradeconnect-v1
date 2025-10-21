import React from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

const ServerErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaExclamationTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Error del Servidor
        </h1>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error interno del servidor. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Recargar Página
          </button>
          <a
            href="/"
            className="inline-block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Ir al Inicio
          </a>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          Código de error: 500
        </div>
      </div>
    </div>
  )
}

export default ServerErrorPage