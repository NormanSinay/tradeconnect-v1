import { create } from 'zustand'

interface UIState {
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string
  mobileMenuOpen: boolean
}

interface UIActions {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  // State
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'Todos',
  mobileMenuOpen: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}))