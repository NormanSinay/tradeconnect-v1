import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketHookOptions {
  url?: string
  enabled?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

interface WebSocketHookReturn {
  socket: Socket | null
  isConnected: boolean
  isConnecting: boolean
  error: Error | null
  connect: () => void
  disconnect: () => void
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback?: (...args: any[]) => void) => void
}

/**
 * Hook personalizado para manejar conexiones WebSocket
 */
export const useWebSocket = (options: WebSocketHookOptions = {}): WebSocketHookReturn => {
  const {
    url = process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
    enabled = true,
    onConnect,
    onDisconnect,
    onError,
  } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Conectar al WebSocket
  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) return

    setIsConnecting(true)
    setError(null)

    try {
      socketRef.current = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true,
      })

      socketRef.current.on('connect', () => {
        setIsConnected(true)
        setIsConnecting(false)
        onConnect?.()
      })

      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
        setIsConnecting(false)
        onDisconnect?.()
      })

      socketRef.current.on('connect_error', (err) => {
        setError(err)
        setIsConnecting(false)
        onError?.(err)
      })

      socketRef.current.on('error', (err) => {
        setError(new Error(err.message || 'WebSocket error'))
        onError?.(new Error(err.message || 'WebSocket error'))
      })
    } catch (err) {
      const connectionError = err instanceof Error ? err : new Error('Failed to connect')
      setError(connectionError)
      setIsConnecting(false)
      onError?.(connectionError)
    }
  }, [url, enabled, onConnect, onDisconnect, onError])

  // Desconectar del WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setIsConnecting(false)
    }
  }, [])

  // Emitir eventos
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event)
    }
  }, [])

  // Escuchar eventos
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }, [])

  // Dejar de escuchar eventos
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback)
      } else {
        socketRef.current.off(event)
      }
    }
  }, [])

  // Conectar automáticamente cuando el componente se monta
  useEffect(() => {
    if (enabled) {
      connect()
    }

    // Cleanup al desmontar
    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  }
}

/**
 * Hook específico para métricas en tiempo real del dashboard
 */
export const useRealtimeMetrics = (enabled: boolean = true) => {
  const [metrics, setMetrics] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const { isConnected, on, off } = useWebSocket({
    enabled,
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  })

  useEffect(() => {
    if (!isConnected) return

    const handleMetricsUpdate = (data: any) => {
      setMetrics(data)
      setLastUpdate(new Date())
    }

    on('metrics:update', handleMetricsUpdate)

    // Suscribirse a actualizaciones de métricas
    on('connect', () => {
      // Emitir evento para suscribirse a métricas
    })

    return () => {
      off('metrics:update', handleMetricsUpdate)
    }
  }, [isConnected, on, off])

  return {
    metrics,
    lastUpdate,
    isConnected,
  }
}

/**
 * Hook para alertas en tiempo real
 */
export const useRealtimeAlerts = (enabled: boolean = true) => {
  const [alerts, setAlerts] = useState<any[]>([])

  const { isConnected, on, off } = useWebSocket({
    enabled,
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  })

  useEffect(() => {
    if (!isConnected) return

    const handleNewAlert = (alert: any) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10)) // Mantener solo las últimas 10 alertas
    }

    const handleAlertResolved = (alertId: string) => {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    }

    on('alert:new', handleNewAlert)
    on('alert:resolved', handleAlertResolved)

    return () => {
      off('alert:new', handleNewAlert)
      off('alert:resolved', handleAlertResolved)
    }
  }, [isConnected, on, off])

  return {
    alerts,
    isConnected,
  }
}