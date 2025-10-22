// Event types
export interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  modality: 'presencial' | 'virtual' | 'hibrido'
  type: 'conferencia' | 'taller' | 'networking' | 'seminario' | 'curso'
  price: number
  image: string
  featured: boolean
  category: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Search and filter types
export interface SearchFilters {
  query?: string
  category?: string
  modality?: string
  dateFrom?: string
  dateTo?: string
}

// Cart types
export interface CartItem {
  event: Event
  quantity: number
}

// UI State types
export interface UIState {
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string
}