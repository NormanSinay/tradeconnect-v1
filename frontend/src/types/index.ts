// Base types for the application
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'organizer' | 'speaker' | 'attendee'
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  capacity: number
  price: number
  category: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  organizerId: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Registration {
  id: string
  eventId: string
  userId: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended'
  registrationDate: Date
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  eventId: string
  quantity: number
  price: number
  event: Event
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  total: number
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface EventForm {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  capacity: number
  price: number
  category: string
  imageUrl?: string
}

// Component props types
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

// Error types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  code: string
  message: string
  details?: ValidationError[]
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Language types
export type Language = 'es' | 'en'

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>