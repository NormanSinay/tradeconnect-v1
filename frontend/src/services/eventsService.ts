/**
 * @fileoverview eventsService.ts - Servicio de eventos para TradeConnect
 * @description Servicio que maneja la búsqueda, obtención y gestión de eventos, incluyendo filtros, categorías y favoritos.
 *
 * Arquitectura recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @author TradeConnect Team
 * @version 1.0.0
 */
import api from './api';
import type {
  Event,
  EventFilters,
  EventSearchResponse,
  EventCategory,
  EventType
} from '@/types/event.types';

export const eventsService = {
  // Buscar eventos con filtros
  async searchEvents(filters: EventFilters = {}, page = 1, limit = 20): Promise<EventSearchResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await api.get<EventSearchResponse>(`/events/search?${params}`);
    return response.data;
  },

  // Obtener evento por ID
  async getEventById(id: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  // Obtener eventos públicos (sin filtros)
  async getPublicEvents(page = 1, limit = 20): Promise<EventSearchResponse> {
    const response = await api.get<EventSearchResponse>(`/public/events?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener eventos destacados
  async getFeaturedEvents(limit = 6): Promise<Event[]> {
    const response = await api.get<Event[]>(`/public/events/featured?limit=${limit}`);
    return response.data;
  },

  // Obtener categorías de eventos
  async getEventCategories(): Promise<EventCategory[]> {
    const response = await api.get<EventCategory[]>('/event-categories');
    return response.data;
  },

  // Obtener tipos de eventos
  async getEventTypes(): Promise<EventType[]> {
    const response = await api.get<EventType[]>('/event-types');
    return response.data;
  },

  // Obtener eventos relacionados
  async getRelatedEvents(eventId: string, limit = 4): Promise<Event[]> {
    const response = await api.get<Event[]>(`/events/${eventId}/related?limit=${limit}`);
    return response.data;
  },

  // Verificar disponibilidad de evento
  async checkEventAvailability(eventId: string, quantity: number): Promise<{
    available: boolean;
    availableSpots: number;
    maxQuantity: number;
  }> {
    const response = await api.get(`/events/${eventId}/availability?quantity=${quantity}`);
    return response.data;
  },

  // Obtener eventos del usuario (si está autenticado)
  async getUserEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/user/events');
    return response.data;
  },

  // Agregar evento a favoritos
  async addToFavorites(eventId: string): Promise<void> {
    await api.post(`/user/favorites/${eventId}`);
  },

  // Remover evento de favoritos
  async removeFromFavorites(eventId: string): Promise<void> {
    await api.delete(`/user/favorites/${eventId}`);
  },

  // Obtener eventos favoritos del usuario
  async getUserFavorites(): Promise<Event[]> {
    const response = await api.get<Event[]>('/user/favorites');
    return response.data;
  },

  // Verificar si un evento está en favoritos
  async isEventFavorite(eventId: string): Promise<boolean> {
    try {
      const response = await api.get(`/user/favorites/${eventId}/check`);
      return response.data.isFavorite;
    } catch {
      return false;
    }
  }
};