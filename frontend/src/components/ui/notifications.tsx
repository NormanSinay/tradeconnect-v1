import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export const Notifications: React.FC = () => {
  const { on } = useWebSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Listen for real-time notifications
    const handleNewNotification = (data: any) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: data.type || 'info',
        title: data.title || 'Notificación',
        message: data.message || '',
        timestamp: new Date(),
        read: false
      }

      setNotifications(prev => [newNotification, ...prev])

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotifications(prev =>
          prev.map(n => n.id === newNotification.id ? { ...n, read: true } : n)
        )
      }, 5000)
    }

    on('notification:new', handleNewNotification)
    on('registration:confirmed', (data) => {
      handleNewNotification({
        type: 'success',
        title: '¡Registro Confirmado!',
        message: `Tu registro para "${data.eventTitle}" ha sido confirmado.`
      })
    })

    on('event:updated', (data) => {
      handleNewNotification({
        type: 'info',
        title: 'Evento Actualizado',
        message: `El evento "${data.title}" ha sido actualizado.`
      })
    })

    return () => {
      // Cleanup listeners would be handled by useWebSocket
    }
  }, [on])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div className="notifications-container">
      <button
        className="notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notificaciones</h4>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="clear-all">
                Limpiar todo
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.type === 'success' && '✅'}
                    {notification.type === 'error' && '❌'}
                    {notification.type === 'warning' && '⚠️'}
                    {notification.type === 'info' && 'ℹ️'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {notification.timestamp.toLocaleTimeString('es-GT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications