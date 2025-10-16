import { apiService } from './api';
import type { ApiResponse } from '@/types';

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

/**
 * Page view data
 */
export interface PageView {
  page: string;
  title?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

/**
 * Conversion data
 */
export interface ConversionData {
  type: 'registration' | 'payment' | 'certificate' | 'share';
  eventId?: number;
  value?: number;
  currency?: 'GTQ' | 'USD';
  metadata?: Record<string, any>;
}

/**
 * Event analytics summary
 */
export interface EventAnalytics {
  eventId: number;
  views: number;
  uniqueVisitors: number;
  registrations: number;
  conversionRate: number;
  revenue: number;
  averageTimeOnPage: number;
  bounceRate: number;
  topReferrers: { source: string; count: number }[];
  viewsByDay: { date: string; views: number }[];
  registrationsByDay: { date: string; registrations: number }[];
}

/**
 * User analytics
 */
export interface UserAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  pageViews: number;
  eventsViewed: number;
  eventsRegistered: number;
  totalSpent: number;
  lastActivity: string;
  deviceTypes: { device: string; count: number }[];
  browserTypes: { browser: string; count: number }[];
}

/**
 * Analytics Service
 * Handles event tracking, page views, and analytics data
 */
export const analyticsService = {
  /**
   * Track page view
   * @param page - Page path
   * @param title - Page title (optional)
   * @param metadata - Additional metadata (optional)
   * @returns Promise<ApiResponse<void>>
   */
  trackPageView: async (
    page: string,
    title?: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/analytics/pageview', {
      page,
      title,
      referrer: document.referrer,
      ...metadata,
    });
  },

  /**
   * Track custom event
   * @param event - Event name
   * @param data - Event data (optional)
   * @returns Promise<ApiResponse<void>>
   */
  trackEvent: async (event: string, data?: Partial<AnalyticsEvent>): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/analytics/event', {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    });
  },

  /**
   * Track conversion
   * @param data - Conversion data
   * @returns Promise<ApiResponse<void>>
   */
  trackConversion: async (data: ConversionData): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/analytics/conversion', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Get event analytics
   * @param eventId - Event ID
   * @param startDate - Start date (optional)
   * @param endDate - End date (optional)
   * @returns Promise<ApiResponse<EventAnalytics>>
   */
  getEventAnalytics: async (
    eventId: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<EventAnalytics>> => {
    return apiService.get<EventAnalytics>(`/analytics/events/${eventId}`, {
      params: { startDate, endDate },
    });
  },

  /**
   * Get user analytics
   * @param userId - User ID (optional, defaults to current user)
   * @returns Promise<ApiResponse<UserAnalytics>>
   */
  getUserAnalytics: async (userId?: number): Promise<ApiResponse<UserAnalytics>> => {
    const endpoint = userId ? `/analytics/users/${userId}` : '/analytics/user';
    return apiService.get<UserAnalytics>(endpoint);
  },

  /**
   * Get platform analytics (admin only)
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise<ApiResponse<any>>
   */
  getPlatformAnalytics: async (startDate?: string, endDate?: string): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/analytics/platform', {
      params: { startDate, endDate },
    });
  },

  /**
   * Get real-time analytics
   * @returns Promise<ApiResponse<any>>
   */
  getRealTimeAnalytics: async (): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/analytics/realtime');
  },

  /**
   * Track search
   * @param query - Search query
   * @param filters - Search filters
   * @param resultsCount - Number of results
   * @returns Promise<ApiResponse<void>>
   */
  trackSearch: async (
    query: string,
    filters?: Record<string, any>,
    resultsCount?: number
  ): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/analytics/search', {
      query,
      filters,
      resultsCount,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track error
   * @param error - Error message
   * @param stack - Error stack trace
   * @param metadata - Additional metadata
   * @returns Promise<ApiResponse<void>>
   */
  trackError: async (
    error: string,
    stack?: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/analytics/error', {
      error,
      stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track cart action
   * @param action - Action type (add, remove, update, checkout)
   * @param eventId - Event ID
   * @param quantity - Quantity
   * @param value - Cart value
   * @returns Promise<ApiResponse<void>>
   */
  trackCartAction: async (
    action: 'add' | 'remove' | 'update' | 'checkout',
    eventId?: number,
    quantity?: number,
    value?: number
  ): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/analytics/cart', {
      action,
      eventId,
      quantity,
      value,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Get funnel analytics
   * @param funnelType - Funnel type (registration, checkout)
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise<ApiResponse<any>>
   */
  getFunnelAnalytics: async (
    funnelType: 'registration' | 'checkout',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> => {
    return apiService.get<any>(`/analytics/funnel/${funnelType}`, {
      params: { startDate, endDate },
    });
  },

  /**
   * Get cohort analysis
   * @param cohortType - Cohort type
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise<ApiResponse<any>>
   */
  getCohortAnalysis: async (
    cohortType: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/analytics/cohort', {
      params: { cohortType, startDate, endDate },
    });
  },

  /**
   * Export analytics report
   * @param reportType - Report type
   * @param params - Report parameters
   * @returns Promise<Blob> - CSV or Excel file
   */
  exportReport: async (reportType: string, params?: any): Promise<Blob> => {
    const response = await apiService.post(
      '/analytics/export',
      { reportType, ...params },
      { responseType: 'blob' }
    );
    return response.data as any;
  },
};

export default analyticsService;
