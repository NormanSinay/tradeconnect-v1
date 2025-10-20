import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '@/services/api'
import ConnectionStatus from './connection-status'
import Notifications from './notifications'

interface NavigationProps {
  onVoiceAssistantToggle?: () => void
}

export const Navigation: React.FC<NavigationProps> = ({
  onVoiceAssistantToggle = () => {}
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)

  useEffect(() => {
    fetchCartCount()
  }, [])

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart')
      if (response.data.success) {
        const items = (response.data.data as any).items || []
        const totalCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(totalCount)
      }
    } catch (err) {
      console.error('Error fetching cart count:', err)
    }
  }

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive)
    onVoiceAssistantToggle()
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Fixed Navigation */}
      <nav>
        <div className="nav-container">
          <div className="logo" onClick={() => handleNavigation('/')}>
            <div className="logo-icon"></div>
            TradeConnect
          </div>

          <ul className="nav-links">
            <li>
              <a
                onClick={() => handleNavigation('/')}
                className={isActive('/') ? 'active' : ''}
              >
                Inicio 🏠
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigation('/events')}
                className={isActive('/events') ? 'active' : ''}
              >
                Eventos 🎯
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigation('/courses')}
                className={isActive('/courses') ? 'active' : ''}
              >
                Cursos 📚
              </a>
            </li>
            <li>
              <a
                onClick={() => handleNavigation('/profile')}
                className={isActive('/profile') ? 'active' : ''}
              >
                Mi Cuenta 👤
              </a>
            </li>
          </ul>

          <div className="ai-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Buscar eventos o cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="cart-icon" onClick={() => handleNavigation('/cart')}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>

          <ConnectionStatus />
          <Notifications />
        </div>
      </nav>

      {/* Voice Assistant */}
      <div
        className={`voice-assistant ${isVoiceActive ? 'active' : ''}`}
        onClick={toggleVoiceAssistant}
        title="Asistente de voz"
      >
        {isVoiceActive ? '🎙️' : '🎤'}
      </div>
    </>
  )
}

export default Navigation