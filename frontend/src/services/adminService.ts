import { apiService } from './api';
import type { ApiResponse, Event, User } from '@/types';

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  activeUsers: number;
  upcomingEvents: number;
  pendingPayments: number;
  recentActivity: any[];
  revenueByMonth: { month: string; revenue: number }[];
  registrationsByEvent: { eventName: string; count: number }[];
  topEvents: Event[];
}

/**
 * Report types
 */
export type ReportType =
  | 'events'
  | 'registrations'
  | 'payments'
  | 'revenue'
  | 'attendance'
  | 'certificates'
  | 'users';

/**
 * Report parameters
 */
export interface ReportParams {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  eventId?: number;
  format?: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
}

/**
 * Admin Operations Service
 * Handles administrative operations for events, users, and reports
 */
export const adminService = {
  /**
   * Get dashboard statistics
   * @returns Promise<ApiResponse<DashboardStats>>
   */
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiService.get<DashboardStats>('/admin/dashboard');
  },

  /**
   * Get all events for admin management
   * @param params - Query parameters (filters, pagination)
   * @returns Promise<ApiResponse<Event[]>>
   */
  getEvents: async (params?: any): Promise<ApiResponse<Event[]>> => {
    return apiService.get<Event[]>('/admin/events', { params });
  },

  /**
   * Create new event (admin)
   * @param data - Event data
   * @returns Promise<ApiResponse<Event>>
   */
  createEvent: async (data: Partial<Event>): Promise<ApiResponse<Event>> => {
    return apiService.post<Event>('/events', data);
  },

  /**
   * Update event
   * @param id - Event ID
   * @param data - Event update data
   * @returns Promise<ApiResponse<Event>>
   */
  updateEvent: async (id: number, data: Partial<Event>): Promise<ApiResponse<Event>> => {
    return apiService.put<Event>(`/events/${id}`, data);
  },

  /**
   * Delete event
   * @param id - Event ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteEvent: async (id: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/events/${id}`);
  },

  /**
   * Publish event
   * @param id - Event ID
   * @param publishData - Publish settings
   * @returns Promise<ApiResponse<Event>>
   */
  publishEvent: async (id: number, publishData?: any): Promise<ApiResponse<Event>> => {
    return apiService.post<Event>(`/events/${id}/publish`, publishData);
  },

  /**
   * Unpublish event
   * @param id - Event ID
   * @returns Promise<ApiResponse<Event>>
   */
  unpublishEvent: async (id: number): Promise<ApiResponse<Event>> => {
    return apiService.post<Event>(`/events/${id}/unpublish`);
  },

  /**
   * Duplicate event
   * @param id - Event ID to duplicate
   * @param options - Duplication options
   * @returns Promise<ApiResponse<Event>>
   */
  duplicateEvent: async (id: number, options?: any): Promise<ApiResponse<Event>> => {
    return apiService.post<Event>(`/events/${id}/duplicate`, options);
  },

  /**
   * Get all registrations with filters
   * @param filters - Filter parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getRegistrations: async (filters?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/admin/registrations', { params: filters });
  },

  /**
   * Get registration by ID
   * @param id - Registration ID
   * @returns Promise<ApiResponse<any>>
   */
  getRegistration: async (id: number): Promise<ApiResponse<any>> => {
    return apiService.get<any>(`/admin/registrations/${id}`);
  },

  /**
   * Cancel registration
   * @param id - Registration ID
   * @param reason - Cancellation reason
   * @returns Promise<ApiResponse<void>>
   */
  cancelRegistration: async (id: number, reason?: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>(`/admin/registrations/${id}/cancel`, { reason });
  },

  /**
   * Confirm registration
   * @param id - Registration ID
   * @returns Promise<ApiResponse<any>>
   */
  confirmRegistration: async (id: number): Promise<ApiResponse<any>> => {
    return apiService.post<any>(`/admin/registrations/${id}/confirm`);
  },

  /**
   * Process payment refund
   * @param paymentId - Payment ID
   * @param amount - Refund amount (optional, full refund if not specified)
   * @param reason - Refund reason
   * @returns Promise<ApiResponse<any>>
   */
  refundPayment: async (
    paymentId: number,
    amount?: number,
    reason?: string
  ): Promise<ApiResponse<any>> => {
    return apiService.post<any>(`/admin/payments/${paymentId}/refund`, { amount, reason });
  },

  /**
   * Get all users
   * @param params - Query parameters
   * @returns Promise<ApiResponse<User[]>>
   */
  getUsers: async (params?: any): Promise<ApiResponse<User[]>> => {
    return apiService.get<User[]>('/admin/users', { params });
  },

  /**
   * Get user by ID
   * @param id - User ID
   * @returns Promise<ApiResponse<User>>
   */
  getUser: async (id: number): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/admin/users/${id}`);
  },

  /**
   * Update user
   * @param id - User ID
   * @param data - User update data
   * @returns Promise<ApiResponse<User>>
   */
  updateUser: async (id: number, data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiService.put<User>(`/admin/users/${id}`, data);
  },

  /**
   * Delete user
   * @param id - User ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/admin/users/${id}`);
  },

  /**
   * Activate/deactivate user
   * @param id - User ID
   * @param active - Active status
   * @returns Promise<ApiResponse<User>>
   */
  setUserStatus: async (id: number, active: boolean): Promise<ApiResponse<User>> => {
    return apiService.post<User>(`/admin/users/${id}/status`, { active });
  },

  /**
   * Generate report
   * @param params - Report parameters
   * @returns Promise<Blob> - Report file (PDF, Excel, CSV)
   */
  generateReport: async (params: ReportParams): Promise<Blob> => {
    const response = await apiService.post('/admin/reports/generate', params, {
      responseType: 'blob',
    });
    return response.data as any;
  },

  /**
   * Get report history
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getReportHistory: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/admin/reports/history', { params });
  },

  /**
   * Get system settings
   * @returns Promise<ApiResponse<Record<string, any>>>
   */
  getSettings: async (): Promise<ApiResponse<Record<string, any>>> => {
    return apiService.get<Record<string, any>>('/admin/settings');
  },

  /**
   * Update system settings
   * @param settings - Settings data
   * @returns Promise<ApiResponse<Record<string, any>>>
   */
  updateSettings: async (
    settings: Record<string, any>
  ): Promise<ApiResponse<Record<string, any>>> => {
    return apiService.put<Record<string, any>>('/admin/settings', settings);
  },

  /**
   * Get audit logs
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getAuditLogs: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/admin/audit-logs', { params });
  },

  /**
   * Get system metrics
   * @returns Promise<ApiResponse<any>>
   */
  getSystemMetrics: async (): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/admin/metrics');
  },
};

export default adminService;
