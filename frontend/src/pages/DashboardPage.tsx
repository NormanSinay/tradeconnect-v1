import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

const DashboardPage: React.FC = () => {
  const { user, token, logout, isAuthenticated } = useAuthStore()

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Panel de control de TradeConnect</p>
          </div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg mb-6"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rol</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-green-600">Autenticado ✅</dd>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Token Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white overflow-hidden shadow rounded-lg mb-6"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Token de Autenticación
              </h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-600 mb-2">Token JWT (truncado para seguridad):</p>
                <code className="text-xs text-gray-800 break-all">
                  {token ? `${token.substring(0, 50)}...` : 'No disponible'}
                </code>
              </div>
              <div className="mt-4">
                <p className="text-sm text-green-600">
                  ✅ Token guardado correctamente en el estado global
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/events">
                  <Button className="w-full bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                    Ver Eventos
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Ir al Home
                  </Button>
                </Link>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Recargar Página
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default DashboardPage