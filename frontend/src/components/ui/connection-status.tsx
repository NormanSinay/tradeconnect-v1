import React from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = useWebSocket()

  return (
    <div
      className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
      title={isConnected ? 'Conectado en tiempo real' : 'Sin conexión'}
    >
      <div className="status-indicator"></div>
      <span className="status-text">
        {isConnected ? 'En línea' : 'Sin conexión'}
      </span>
    </div>
  )
}

export default ConnectionStatus