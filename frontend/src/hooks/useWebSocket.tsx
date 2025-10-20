import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  isConnecting: boolean
  connectionState: 'disconnected' | 'connecting' | 'reconnecting' | 'connected' | 'error'
  connect: () => void
  disconnect: () => void
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback?: (...args: any[]) => void) => void
  subscribe: (event: string, callback: (...args: any[]) => void) => () => void
  sendMessage: (event: string, data: any) => void
  joinEvent: (eventId: string) => void
  leaveEvent: (eventId: string) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'reconnecting' | 'connected' | 'error'>('disconnected')

  const connect = useCallback(() => {
    if (socket?.connected) return

    setIsConnecting(true)
    setConnectionState('connecting')

    const newSocket = io(process.env.NODE_ENV === 'production'
      ? 'wss://api.tradeconnect.gt'
      : 'ws://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

    newSocket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionState('connected')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionState('disconnected')
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionState('error')
    })

    newSocket.on('reconnect_attempt', () => {
      console.log('WebSocket reconnecting...')
      setIsConnecting(true)
      setConnectionState('reconnecting')
    })

    newSocket.on('reconnect', () => {
      console.log('WebSocket reconnected')
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionState('connected')
    })

    // Listen for real-time events
    newSocket.on('event:updated', (data) => {
      console.log('Event updated:', data)
      // TODO: Update event data in components
    })

    newSocket.on('cart:updated', (data) => {
      console.log('Cart updated:', data)
      // TODO: Update cart data in components
    })

    newSocket.on('notification:new', (data) => {
      console.log('New notification:', data)
      // TODO: Show notification to user
    })

    newSocket.on('registration:confirmed', (data) => {
      console.log('Registration confirmed:', data)
      // TODO: Update registration status
    })

    setSocket(newSocket)
  }, [socket])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
      setIsConnecting(false)
      setConnectionState('disconnected')
    }
  }, [socket])

  const emit = useCallback((event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot emit:', event)
    }
  }, [socket])

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }, [socket])

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }, [socket])

  const subscribe = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback)
      return () => socket.off(event, callback)
    }
    return () => {}
  }, [socket])

  const sendMessage = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot send message:', event)
    }
  }, [socket])

  const joinEvent = useCallback((eventId: string) => {
    if (socket?.connected) {
      socket.emit('join_event', { eventId })
    }
  }, [socket])

  const leaveEvent = useCallback((eventId: string) => {
    if (socket?.connected) {
      socket.emit('leave_event', { eventId })
    }
  }, [socket])

  useEffect(() => {
    // Auto-connect on mount
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  const value: WebSocketContextType = {
    socket,
    isConnected,
    isConnecting,
    connectionState,
    connect,
    disconnect,
    emit,
    on,
    off,
    subscribe,
    sendMessage,
    joinEvent,
    leaveEvent
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}