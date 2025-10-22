import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import ConnectionStatus from './connection-status'
import Notifications from './notifications'
import { FaHome, FaCalendarAlt, FaBook, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaShoppingCart, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'

const SCROLL_THRESHOLD = 100

interface NavigationProps {
  onVoiceAssistantToggle?: () => void
}

export const Navigation: React.FC<NavigationProps> = ({
  onVoiceAssistantToggle = () => {}
}) => {
  // Safe auth context access with fallback for SSR
  let authContext
  try {
    authContext = useAuth()
  } catch (error) {
    authContext = { user: null, logout: () => {} }
  }

  const { user, logout } = authContext
  const [cartCount, setCartCount] = useState(0)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    fetchCartCount()
  }, [])

  useEffect(() => {
    // Only add scroll listener in browser environment
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > SCROLL_THRESHOLD)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchCartCount = async () => {
    // Only fetch cart count in browser environment
    if (typeof window === 'undefined') return

    try {
      const response = await api.get('/cart')
      if (response.data.success) {
        const items = (response.data.data as any).items || []
        const totalCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(totalCount)
      }
    } catch (err) {
      // Silenciar errores de red cuando el backend no está disponible
      // console.error('Error fetching cart count:', err)
      setCartCount(0)
    }
  }

  const handleNavigation = (path: string) => {
    // Use Astro's navigation for client-side routing
    if (typeof window !== 'undefined') {
      window.location.href = path
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Use window.location for navigation to ensure full page reload
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get current path for active link highlighting
  const getCurrentPath = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname
    }
    return '/'
  }

  const isActive = (path: string) => {
    return getCurrentPath() === path
  }


  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive)
    onVoiceAssistantToggle()
  }

  // Remove the old isActive function - will be replaced below

  return (
    <>
      {/* Fixed Navigation */}
      <nav className={isScrolled ? 'nav-scrolled' : ''} style={{
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        boxShadow: isScrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div className="nav-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <div className="logo" onClick={() => handleNavigation('/')} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}>
            <div className="logo-icon" style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--primary)',
              borderRadius: '8px'
            }}></div>
            TradeConnect
          </div>

          <ul className="nav-links" style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '2rem'
          }}>
            <li style={{ margin: 0 }}>
              <a
                onClick={() => handleNavigation('/')}
                className={isActive('/') ? 'active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive('/') ? 'var(--primary)' : 'var(--foreground)',
                  fontWeight: isActive('/') ? '600' : '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <FaHome className="nav-icon" />
                Inicio
              </a>
            </li>
            <li style={{ margin: 0 }}>
              <a
                onClick={() => handleNavigation('/events')}
                className={isActive('/events') ? 'active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive('/events') ? 'var(--primary)' : 'var(--foreground)',
                  fontWeight: isActive('/events') ? '600' : '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <FaCalendarAlt className="nav-icon" />
                Eventos y Cursos
              </a>
            </li>
            {user ? (
              <>
                <li style={{ margin: 0 }}>
                  <a
                    onClick={() => handleNavigation('/profile')}
                    className={isActive('/profile') ? 'active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive('/profile') ? 'var(--primary)' : 'var(--foreground)',
                      fontWeight: isActive('/profile') ? '600' : '500',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <FaUser className="nav-icon" />
                    Mi Cuenta
                  </a>
                </li>
                <li style={{ margin: 0 }}>
                  <a
                    onClick={handleLogout}
                    className="logout-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--destructive)',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <FaSignOutAlt className="nav-icon" />
                    Cerrar Sesión
                  </a>
                </li>
              </>
            ) : (
              <>
                <li style={{ margin: 0 }}>
                  <a
                    onClick={() => handleNavigation('/login')}
                    className={isActive('/login') ? 'active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive('/login') ? 'var(--primary)' : 'var(--foreground)',
                      fontWeight: isActive('/login') ? '600' : '500',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <FaSignInAlt className="nav-icon" />
                    Iniciar Sesión
                  </a>
                </li>
                <li style={{ margin: 0 }}>
                  <a
                    onClick={() => handleNavigation('/registro')}
                    className={isActive('/registro') ? 'active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive('/registro') ? 'var(--primary)' : 'var(--foreground)',
                      fontWeight: isActive('/registro') ? '600' : '500',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <FaUserPlus className="nav-icon" />
                    Registrarse
                  </a>
                </li>
              </>
            )}
          </ul>

          <div className="cart-icon" onClick={() => handleNavigation('/cart')} style={{
            position: 'relative',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <FaShoppingCart className="cart-icon-svg" style={{
              fontSize: '1.25rem',
              color: 'var(--foreground)'
            }} />
            {cartCount > 0 && (
              <span className="cart-badge" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </div>

          {/* ConnectionStatus and Notifications hidden as requested */}
        </div>
      </nav>

      {/* Voice Assistant - Hidden as per requirements */}
    </>
  )
}

export default Navigation
