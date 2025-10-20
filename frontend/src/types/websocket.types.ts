// WebSocket event types and interfaces
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: Date
  userId?: string
  eventId?: string
}

export interface WebSocketEventData {
  id: string
  timestamp: Date
  userId: string
}

// Event-specific payload types
export interface EventUpdatePayload extends WebSocketEventData {
  eventId: string
  title: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  changes: Record<string, any>
}

export interface RegistrationPayload extends WebSocketEventData {
  eventId: string
  eventTitle: string
  userId: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended'
}

export interface PaymentPayload extends WebSocketEventData {
  eventId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
}

export interface NotificationPayload extends WebSocketEventData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
}

export interface AttendancePayload extends WebSocketEventData {
  eventId: string
  eventTitle: string
  checkInTime: Date
  location?: string
}

export interface ChatMessagePayload extends WebSocketEventData {
  eventId: string
  message: string
  senderName: string
  isPrivate: boolean
  recipientId?: string
}

export interface LiveStatsPayload extends WebSocketEventData {
  eventId: string
  attendeesCount: number
  capacity: number
  waitlistCount: number
  revenue: number
}

// WebSocket event types
export type WebSocketEventType =
  | 'event_updated'
  | 'registration_confirmed'
  | 'registration_cancelled'
  | 'payment_completed'
  | 'payment_failed'
  | 'notification'
  | 'attendance_checked'
  | 'chat_message'
  | 'live_stats_updated'
  | 'user_joined'
  | 'user_left'
  | 'event_started'
  | 'event_ended'

// WebSocket connection states
export type WebSocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// WebSocket hook return type
export interface WebSocketHookReturn {
  socket: any | null
  isConnected: boolean
  isConnecting: boolean
  connectionState: WebSocketConnectionState
  lastMessage: WebSocketMessage | null
  sendMessage: (type: WebSocketEventType, payload: any) => void
  subscribe: (event: WebSocketEventType, callback: (data: any) => void) => () => void
  unsubscribe: (event: WebSocketEventType, callback?: (data: any) => void) => void
  connect: () => void
  disconnect: () => void
  joinEvent: (eventId: string) => void
  leaveEvent: (eventId: string) => void
}

// WebSocket service configuration
export interface WebSocketConfig {
  url: string
  authToken?: string
  userId?: string
  reconnectAttempts: number
  reconnectInterval: number
  maxReconnectAttempts: number
}

// Event room types for multi-room support
export interface EventRoom {
  eventId: string
  participants: string[]
  isActive: boolean
  lastActivity: Date
}