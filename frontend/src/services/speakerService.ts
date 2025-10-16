import { apiService } from './api';
import type { ApiResponse, Speaker, Specialty } from '@/types';

/**
 * Speaker creation/update data
 */
export interface SpeakerData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  company?: string;
  position?: string;
  specialtyIds?: number[];
  isActive?: boolean;
}

/**
 * Speaker availability
 */
export interface SpeakerAvailability {
  speakerId: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  reason?: string;
}

/**
 * Speaker contract
 */
export interface SpeakerContract {
  id: number;
  speakerId: number;
  eventId: number;
  contractType: 'paid' | 'volunteer' | 'sponsored';
  amount?: number;
  currency?: 'GTQ' | 'USD';
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  contractUrl?: string;
  signedAt?: string;
}

/**
 * Speakers Service
 * Handles speaker management, profiles, and assignments
 */
export const speakerService = {
  /**
   * Get all speakers
   * @param params - Query parameters (filters, pagination)
   * @returns Promise<ApiResponse<Speaker[]>>
   */
  getSpeakers: async (params?: any): Promise<ApiResponse<Speaker[]>> => {
    return apiService.get<Speaker[]>('/speakers', { params });
  },

  /**
   * Get speaker by ID
   * @param id - Speaker ID
   * @returns Promise<ApiResponse<Speaker>>
   */
  getSpeakerById: async (id: number): Promise<ApiResponse<Speaker>> => {
    return apiService.get<Speaker>(`/speakers/${id}`);
  },

  /**
   * Create new speaker
   * @param data - Speaker data
   * @returns Promise<ApiResponse<Speaker>>
   */
  createSpeaker: async (data: SpeakerData): Promise<ApiResponse<Speaker>> => {
    return apiService.post<Speaker>('/speakers', data);
  },

  /**
   * Update speaker
   * @param id - Speaker ID
   * @param data - Speaker update data
   * @returns Promise<ApiResponse<Speaker>>
   */
  updateSpeaker: async (id: number, data: Partial<SpeakerData>): Promise<ApiResponse<Speaker>> => {
    return apiService.put<Speaker>(`/speakers/${id}`, data);
  },

  /**
   * Delete speaker
   * @param id - Speaker ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteSpeaker: async (id: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/speakers/${id}`);
  },

  /**
   * Upload speaker avatar
   * @param id - Speaker ID
   * @param file - Avatar image file
   * @returns Promise<ApiResponse<{ avatarUrl: string }>>
   */
  uploadAvatar: async (id: number, file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiService.upload<{ avatarUrl: string }>(`/speakers/${id}/avatar`, formData);
  },

  /**
   * Get speaker specialties
   * @returns Promise<ApiResponse<Specialty[]>>
   */
  getSpecialties: async (): Promise<ApiResponse<Specialty[]>> => {
    return apiService.get<Specialty[]>('/speaker-specialties');
  },

  /**
   * Get speakers by specialty
   * @param specialtyId - Specialty ID
   * @returns Promise<ApiResponse<Speaker[]>>
   */
  getSpeakersBySpecialty: async (specialtyId: number): Promise<ApiResponse<Speaker[]>> => {
    return apiService.get<Speaker[]>(`/speakers/specialty/${specialtyId}`);
  },

  /**
   * Get speaker's events
   * @param id - Speaker ID
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getSpeakerEvents: async (id: number, params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>(`/speakers/${id}/events`, { params });
  },

  /**
   * Assign speaker to event
   * @param speakerId - Speaker ID
   * @param eventId - Event ID
   * @param sessionId - Event session ID (optional)
   * @returns Promise<ApiResponse<void>>
   */
  assignToEvent: async (
    speakerId: number,
    eventId: number,
    sessionId?: number
  ): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/speaker-events', {
      speakerId,
      eventId,
      sessionId,
    });
  },

  /**
   * Remove speaker from event
   * @param speakerId - Speaker ID
   * @param eventId - Event ID
   * @returns Promise<ApiResponse<void>>
   */
  removeFromEvent: async (speakerId: number, eventId: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/speaker-events/${speakerId}/${eventId}`);
  },

  /**
   * Get speaker availability
   * @param id - Speaker ID
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise<ApiResponse<SpeakerAvailability[]>>
   */
  getAvailability: async (
    id: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<SpeakerAvailability[]>> => {
    return apiService.get<SpeakerAvailability[]>(`/speakers/${id}/availability`, {
      params: { startDate, endDate },
    });
  },

  /**
   * Set speaker availability
   * @param id - Speaker ID
   * @param availability - Availability data
   * @returns Promise<ApiResponse<SpeakerAvailability>>
   */
  setAvailability: async (
    id: number,
    availability: Omit<SpeakerAvailability, 'speakerId'>
  ): Promise<ApiResponse<SpeakerAvailability>> => {
    return apiService.post<SpeakerAvailability>(`/speakers/${id}/availability`, availability);
  },

  /**
   * Get speaker contracts
   * @param id - Speaker ID
   * @returns Promise<ApiResponse<SpeakerContract[]>>
   */
  getContracts: async (id: number): Promise<ApiResponse<SpeakerContract[]>> => {
    return apiService.get<SpeakerContract[]>(`/speakers/${id}/contracts`);
  },

  /**
   * Create speaker contract
   * @param data - Contract data
   * @returns Promise<ApiResponse<SpeakerContract>>
   */
  createContract: async (
    data: Omit<SpeakerContract, 'id'>
  ): Promise<ApiResponse<SpeakerContract>> => {
    return apiService.post<SpeakerContract>('/speaker-contracts', data);
  },

  /**
   * Get speaker payments
   * @param id - Speaker ID
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getPayments: async (id: number, params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>(`/speakers/${id}/payments`, { params });
  },

  /**
   * Get speaker evaluations
   * @param id - Speaker ID
   * @returns Promise<ApiResponse<any[]>>
   */
  getEvaluations: async (id: number): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>(`/speakers/${id}/evaluations`);
  },

  /**
   * Search speakers
   * @param query - Search query
   * @param filters - Additional filters
   * @returns Promise<ApiResponse<Speaker[]>>
   */
  searchSpeakers: async (query: string, filters?: any): Promise<ApiResponse<Speaker[]>> => {
    return apiService.get<Speaker[]>('/speakers/search', {
      params: { q: query, ...filters },
    });
  },
};

export default speakerService;
