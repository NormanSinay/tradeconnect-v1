import React from 'react'
import { FaSearch } from 'react-icons/fa'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaSearch className="mx-auto h-16 w-16 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          404
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Página No Encontrada
        </h2>
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio.
        </p>
        <div className="space-y-3">
          <a
            href="/"
            className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir al Inicio
          </a>
          <button
            onClick={() => window.history.back()}
            className="inline-block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage