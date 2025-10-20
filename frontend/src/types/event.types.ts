/**
 * @fileoverview Event types for TradeConnect Frontend
 * @description

Arquitectura recomendada si migras:
  React (componentes interactivos)
    ↓
  Astro (routing y SSR)
    ↓
  shadcn/ui (componentes UI)
    ↓
  Tailwind CSS (estilos)
    ↓
  Radix UI (primitivos accesibles)
    ↓
  React Icons (iconos)

 * @architecture
 * - React: Componentes interactivos con hooks y context
 * - Astro: Routing y Server-Side Rendering (SSR)
 * - shadcn/ui: Componentes UI preconstruidos
 * - Tailwind CSS: Sistema de estilos utilitarios
 * - Radix UI: Primitivos accesibles para componentes
 * - React Icons: Biblioteca de iconos
 *
 * @compatibility SSR: Compatible con Astro SSR
 * @compatibility React: Compatible con React 18+
 * @compatibility TypeScript: Tipos completos incluidos
 * @version 1.0.0
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: EventCategory;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  timezone: string;
  location?: string;
  virtualLink?: string;
  capacity: number;
  availableSpots: number;
  price: number;
  currency: string;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  isFeatured: boolean;
  isPublished: boolean;
  images: EventImage[];
  speakers: Speaker[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
}

export interface EventType {
  id: string;
  name: string;
  slug: string;
}

export interface EventStatus {
  id: string;
  name: string;
  slug: string;
}

export interface EventImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  specialties: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface EventFilters {
  search?: string | undefined;
  category?: string | undefined;
  type?: string | undefined;
  modality?: 'presencial' | 'virtual' | 'hibrido' | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  location?: string | undefined;
  featured?: boolean | undefined;
  sortBy?: 'relevance' | 'date' | 'price' | 'popularity' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface EventSearchResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: EventFilters;
}

export interface EventCardProps {
  event: Event;
  onViewDetails: (eventId: string) => void;
  onAddToCart?: (eventId: string) => void;
  onToggleFavorite?: (eventId: string) => void;
  isFavorite?: boolean;
  compact?: boolean;
}

export interface EventListViewProps {
  events: Event[];
  loading?: boolean;
  onEventClick: (eventId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface EventGridViewProps extends EventListViewProps {
  columns?: number;
}

export interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  categories: EventCategory[];
  types: EventType[];
  loading?: boolean;
}

export interface EventSortOptionsProps {
  sortBy: EventFilters['sortBy'];
  sortOrder: EventFilters['sortOrder'];
  onSortChange: (sortBy: EventFilters['sortBy'], sortOrder: EventFilters['sortOrder']) => void;
}

export interface EventPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}