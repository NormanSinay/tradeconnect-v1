import { apiService } from './api';
import type { ApiResponse, User } from '@/types';

/**
 * User profile update data
 */
export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  company?: string;
  position?: string;
  website?: string;
  linkedinUrl?: string;
  preferences?: Record<string, any>;
}

/**
 * Password change data
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 2FA setup response
 */
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * User Management Service
 * Handles user profile, settings, and account management
 */
export const userService = {
  /**
   * Get current user profile
   * @returns Promise<ApiResponse<User>>
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiService.get<User>('/users/profile');
  },

  /**
   * Update user profile
   * @param data - Profile update data
   * @returns Promise<ApiResponse<User>>
   */
  updateProfile: async (data: UserProfileUpdate): Promise<ApiResponse<User>> => {
    return apiService.put<User>('/users/profile', data);
  },

  /**
   * Upload user avatar
   * @param file - Avatar image file
   * @returns Promise<ApiResponse<{ avatarUrl: string }>>
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiService.upload<{ avatarUrl: string }>('/users/profile/avatar', formData);
  },

  /**
   * Delete user avatar
   * @returns Promise<ApiResponse<void>>
   */
  deleteAvatar: async (): Promise<ApiResponse<void>> => {
    return apiService.delete<void>('/users/profile/avatar');
  },

  /**
   * Change password
   * @param data - Password change data
   * @returns Promise<ApiResponse<void>>
   */
  changePassword: async (data: PasswordChangeData): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/auth/change-password', data);
  },

  /**
   * Enable two-factor authentication
   * @returns Promise<ApiResponse<TwoFactorSetup>>
   */
  enable2FA: async (): Promise<ApiResponse<TwoFactorSetup>> => {
    return apiService.post<TwoFactorSetup>('/auth/2fa/enable');
  },

  /**
   * Disable two-factor authentication
   * @param code - 2FA verification code
   * @returns Promise<ApiResponse<void>>
   */
  disable2FA: async (code: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/auth/2fa/disable', { code });
  },

  /**
   * Verify 2FA code
   * @param code - 2FA verification code
   * @returns Promise<ApiResponse<{ valid: boolean }>>
   */
  verify2FA: async (code: string): Promise<ApiResponse<{ valid: boolean }>> => {
    return apiService.post<{ valid: boolean }>('/auth/2fa/verify', { code });
  },

  /**
   * Get 2FA status
   * @returns Promise<ApiResponse<{ enabled: boolean }>>
   */
  get2FAStatus: async (): Promise<ApiResponse<{ enabled: boolean }>> => {
    return apiService.get<{ enabled: boolean }>('/auth/2fa/status');
  },

  /**
   * Get new 2FA backup codes
   * @returns Promise<ApiResponse<{ backupCodes: string[] }>>
   */
  regenerate2FABackupCodes: async (): Promise<ApiResponse<{ backupCodes: string[] }>> => {
    return apiService.post<{ backupCodes: string[] }>('/auth/2fa/backup-codes/regenerate');
  },

  /**
   * Get user's event registrations
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getUserRegistrations: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/users/registrations', { params });
  },

  /**
   * Get user's payment history
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getUserPayments: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/users/payments', { params });
  },

  /**
   * Get user's certificates
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getUserCertificates: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/users/certificates', { params });
  },

  /**
   * Get user's favorite events
   * @returns Promise<ApiResponse<any[]>>
   */
  getUserFavorites: async (): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/users/favorites');
  },

  /**
   * Add event to favorites
   * @param eventId - Event ID
   * @returns Promise<ApiResponse<void>>
   */
  addToFavorites: async (eventId: number): Promise<ApiResponse<void>> => {
    return apiService.post<void>(`/users/favorites/${eventId}`);
  },

  /**
   * Remove event from favorites
   * @param eventId - Event ID
   * @returns Promise<ApiResponse<void>>
   */
  removeFromFavorites: async (eventId: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/users/favorites/${eventId}`);
  },

  /**
   * Get user preferences
   * @returns Promise<ApiResponse<Record<string, any>>>
   */
  getPreferences: async (): Promise<ApiResponse<Record<string, any>>> => {
    return apiService.get<Record<string, any>>('/users/preferences');
  },

  /**
   * Update user preferences
   * @param preferences - User preferences
   * @returns Promise<ApiResponse<Record<string, any>>>
   */
  updatePreferences: async (
    preferences: Record<string, any>
  ): Promise<ApiResponse<Record<string, any>>> => {
    return apiService.put<Record<string, any>>('/users/preferences', preferences);
  },

  /**
   * Delete user account
   * @param password - User password for confirmation
   * @returns Promise<ApiResponse<void>>
   */
  deleteAccount: async (password: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/users/account/delete', { password });
  },

  /**
   * Request account data export (GDPR)
   * @returns Promise<ApiResponse<{ exportId: string }>>
   */
  requestDataExport: async (): Promise<ApiResponse<{ exportId: string }>> => {
    return apiService.post<{ exportId: string }>('/users/data-export/request');
  },

  /**
   * Download account data export
   * @param exportId - Export ID
   * @returns Promise<Blob> - ZIP file with user data
   */
  downloadDataExport: async (exportId: string): Promise<Blob> => {
    const response = await apiService.get(`/users/data-export/${exportId}/download`, {
      responseType: 'blob',
    });
    return response.data as any;
  },
};

export default userService;
