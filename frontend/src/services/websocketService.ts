import { io, Socket } from 'socket.io-client'
import type {
  WebSocketConfig,
  WebSocketEventType,
  WebSocketMessage,
  WebSocketConnectionState,
  EventUpdatePayload,
  RegistrationPayload,
  PaymentPayload,
  NotificationPayload,
  AttendancePayload,
  ChatMessagePayload,
  LiveStatsPayload
} from '@/types/websocket.types'

class WebSocketService {
  private socket: Socket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private eventListeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map()
  private connectionState: WebSocketConnectionState = 'disconnected'
  private connectionStateListeners: Set<(state: WebSocketConnectionState) => void> = new Set()

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
      authToken: config.authToken,
      userId: config.userId,
      reconnectAttempts: config.reconnectAttempts || 0,
      reconnectInterval: config.reconnectInterval || 1000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
    }
  }

  // Connection management
  async connect(authToken?: string, userId?: string): Promise<void> {
    if (this.socket?.connected) return

    this.connectionState = 'connecting'
    this.notifyConnectionStateListeners()

    try {
      this.socket = io(this.config.url, {
        auth: {
          token: authToken || this.config.authToken,
          userId: userId || this.config.userId,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      })

      this.setupEventHandlers()
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.connectionState = 'error'
      this.notifyConnectionStateListeners()
      throw error
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.connectionState = 'disconnected'
    this.notifyConnectionStateListeners()
    this.reconnectAttempts = 0
  }

  // Event handlers setup
  private setupEventHandlers(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.connectionState = 'connected'
      this.notifyConnectionStateListeners()
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.connectionState = 'disconnected'
      this.notifyConnectionStateListeners()

      if (reason === 'io server disconnect' && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.connectionState = 'error'
      this.notifyConnectionStateListeners()

      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    })

    // Message events
    this.socket.on('message', (data: any) => {
      const message: WebSocketMessage = {
        type: data.type || 'unknown',
        payload: data.payload,
        timestamp: new Date(),
        userId: data.userId,
        eventId: data.eventId,
      }
      this.notifyEventListeners('message' as WebSocketEventType, message)
    })

    // Specific event handlers
    this.setupTypedEventHandlers()
  }

  private setupTypedEventHandlers(): void {
    if (!this.socket) return

    const eventHandlers = {
      event_updated: (data: EventUpdatePayload) => this.notifyEventListeners('event_updated', data),
      registration_confirmed: (data: RegistrationPayload) => this.notifyEventListeners('registration_confirmed', data),
      payment_completed: (data: PaymentPayload) => this.notifyEventListeners('payment_completed', data),
      notification: (data: NotificationPayload) => this.notifyEventListeners('notification', data),
      attendance_checked: (data: AttendancePayload) => this.notifyEventListeners('attendance_checked', data),
      chat_message: (data: ChatMessagePayload) => this.notifyEventListeners('chat_message', data),
      live_stats_updated: (data: LiveStatsPayload) => this.notifyEventListeners('live_stats_updated', data),
      user_joined: (data: any) => this.notifyEventListeners('user_joined', data),
      user_left: (data: any) => this.notifyEventListeners('user_left', data),
      event_started: (data: any) => this.notifyEventListeners('event_started', data),
      event_ended: (data: any) => this.notifyEventListeners('event_ended', data),
    }

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.socket!.on(event, handler)
    })
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    this.connectionState = 'reconnecting'
    this.notifyConnectionStateListeners()

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  // Event subscription management
  on(event: WebSocketEventType, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.eventListeners.delete(event)
        }
      }
    }
  }

  off(event: WebSocketEventType, callback?: (data: any) => void): void {
    if (callback) {
      const listeners = this.eventListeners.get(event)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.eventListeners.delete(event)
        }
      }
    } else {
      this.eventListeners.delete(event)
    }
  }

  private notifyEventListeners(event: WebSocketEventType, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error)
        }
      })
    }
  }

  // Connection state management
  onConnectionStateChange(callback: (state: WebSocketConnectionState) => void): () => void {
    this.connectionStateListeners.add(callback)

    // Return unsubscribe function
    return () => {
      this.connectionStateListeners.delete(callback)
    }
  }

  private notifyConnectionStateListeners(): void {
    this.connectionStateListeners.forEach(callback => {
      try {
        callback(this.connectionState)
      } catch (error) {
        console.error('Error in connection state listener:', error)
      }
    })
  }

  // Message sending
  sendMessage(type: WebSocketEventType, payload: any): void {
    if (this.socket?.connected) {
      this.socket.emit('message', { type, payload, timestamp: new Date() })
    } else {
      console.warn('WebSocket not connected, message not sent:', { type, payload })
    }
  }

  // Room management for events
  joinEvent(eventId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_event', { eventId })
      console.log(`Joined event room: ${eventId}`)
    }
  }

  leaveEvent(eventId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_event', { eventId })
      console.log(`Left event room: ${eventId}`)
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  get currentConnectionState(): WebSocketConnectionState {
    return this.connectionState
  }

  get socketInstance(): Socket | null {
    return this.socket
  }

  // Update configuration
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()

// Export the class for testing
export { WebSocketService }