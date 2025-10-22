import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-[#6B1E22] transition-colors">
                Inicio
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-[#6B1E22] transition-colors">
                Eventos y Cursos
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-[#6B1E22] transition-colors">
                Acerca de
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-[#6B1E22] transition-colors">
                Contacto
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-[#6B1E22] transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-[#6B1E22] text-white px-4 py-2 rounded-lg hover:bg-[#8a2b30] transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="mb-6"
              >
                <h1 className="text-3xl font-bold text-[#6B1E22]">TradeConnect</h1>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-semibold text-gray-900 mb-2"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                {subtitle}
              </motion.p>
            </div>

            {children}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TradeConnect</h3>
              <p className="text-gray-400">
                Plataforma e-commerce para la gestión de eventos y cursos de la Cámara de Comercio de Guatemala.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Inicio</Link></li>
                <li><Link to="/events" className="text-gray-400 hover:text-white transition-colors">Eventos y Cursos</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">Acerca de</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@tradeconnect.com</li>
                <li>Teléfono: +502 1234 5678</li>
                <li>Dirección: Ciudad de Guatemala, Guatemala</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2023 TradeConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AuthLayout