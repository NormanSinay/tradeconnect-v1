import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useUIStore } from '@/stores/uiStore'

const Navigation: React.FC = () => {
  const location = useLocation()
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()

  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/events', label: 'Eventos y Cursos' },
    { path: '/about', label: 'Acerca de' },
    { path: '/contact', label: 'Contacto' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="text-2xl font-bold text-[#6B1E22]">TradeConnect</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-[#6B1E22] bg-red-50'
                    : 'text-gray-700 hover:text-[#6B1E22] hover:bg-red-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-[#6B1E22] border border-[#6B1E22] rounded-md hover:bg-red-50 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-[#6B1E22] text-white rounded-md hover:bg-[#5a191e] transition-colors"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-[#6B1E22] transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-[#6B1E22] bg-red-50'
                      : 'text-gray-700 hover:text-[#6B1E22] hover:bg-red-50'
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-[#6B1E22] border border-[#6B1E22] rounded-md text-center hover:bg-red-50 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-[#6B1E22] text-white rounded-md text-center hover:bg-[#5a191e] transition-colors"
                  onClick={closeMobileMenu}
                >
                  Registrarse
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navigation