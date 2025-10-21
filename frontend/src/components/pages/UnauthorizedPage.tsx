import React from 'react'
import { FaLock } from 'react-icons/fa'

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaLock className="mx-auto h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección. Contacta al administrador si crees que esto es un error.
        </p>
        <div className="space-y-3">
          <a
            href="/"
            className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir al Inicio
          </a>
          <a
            href="/login"
            className="inline-block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage