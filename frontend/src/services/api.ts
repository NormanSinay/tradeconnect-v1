import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@/utils/constants';
import type { ApiResponse } from '@/types';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any): any => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          // Attempt to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.message);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // File upload
  upload: async <T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };
    const response = await api.post(url, formData, uploadConfig);
    return response.data;
  },
};

// Auth API service
export const authService = {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
    apiService.post('/auth/login', credentials),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string | undefined;
    acceptTerms: boolean;
  }) => apiService.post('/auth/register', data),

  logout: () => apiService.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiService.post('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    apiService.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiService.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    apiService.post('/auth/verify-email', { token }),

  getProfile: () => apiService.get('/auth/profile'),

  updateProfile: (data: any) => apiService.put('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiService.post('/auth/change-password', data),

  enable2FA: () => apiService.post('/auth/2fa/enable'),

  disable2FA: (code: string) => apiService.post('/auth/2fa/disable', { code }),

  verify2FA: (code: string) => apiService.post('/auth/2fa/verify', { code }),

  get2FAStatus: () => apiService.get('/auth/2fa/status'),
};

// Events API service
export const eventsService = {
  getEvents: (params?: any) => apiService.get('/events', { params }),

  createEvent: (data: any) => apiService.post('/events', data),

  getEvent: (id: number) => apiService.get(`/events/${id}`),

  updateEvent: (id: number, data: any) => apiService.put(`/events/${id}`, data),

  deleteEvent: (id: number) => apiService.delete(`/events/${id}`),

  publishEvent: (id: number, data?: any) => apiService.post(`/events/${id}/publish`, data),

  duplicateEvent: (id: number, data?: any) => apiService.post(`/events/${id}/duplicate`, data),

  uploadMedia: (id: number, formData: FormData) =>
    apiService.upload(`/events/${id}/upload-media`, formData),

  getEventMedia: (id: number) => apiService.get(`/events/${id}/media`),

  deleteMedia: (eventId: number, mediaId: number) =>
    apiService.delete(`/events/${eventId}/media/${mediaId}`),
};

// Public Events API service
export const publicEventsService = {
  getEvents: (params?: any) => apiService.get('/public/events', { params }),

  getEvent: (id: number) => apiService.get(`/public/events/${id}`),

  searchEvents: (params?: any) => apiService.get('/public/events/search', { params }),

  getCalendarEvents: (params?: any) => apiService.get('/public/events/calendar', { params }),

  getCategories: () => apiService.get('/public/events/categories'),

  verifyCertificate: (hash: string) => apiService.get(`/public/certificates/verify/${hash}`),
};

// Cart API service (deprecated - use cartService.ts instead)
// Kept for backward compatibility
export const cartServiceLegacy = {
  getCart: (params?: any) => apiService.get('/cart', { params }),

  addItem: (data: any, params?: any) => apiService.post('/cart/add', data, { params }),

  updateItem: (data: any, params?: any) => apiService.put('/cart/update', data, { params }),

  removeItem: (itemId: number, params?: any) =>
    apiService.delete(`/cart/remove/${itemId}`, { params }),

  clearCart: (params?: any) => apiService.delete('/cart/clear', { params }),

  applyPromoCode: (data: any, params?: any) =>
    apiService.post('/cart/apply-promo', data, { params }),

  calculateCart: (params?: any) => apiService.get('/cart/calculate', { params }),
};

// Payments API service
// Maintained for backward compatibility - enhanced version in paymentService.ts
export const paymentsService = {
  processPayment: (data: any) => apiService.post('/payments/process', data),

  createPayPalPayment: (data: any) => apiService.post('/payments/paypal/create', data),

  createStripePayment: (data: any) => apiService.post('/payments/stripe/create', data),

  createNeoNetPayment: (data: any) => apiService.post('/payments/neonet/create', data),

  createBamPayment: (data: any) => apiService.post('/payments/bam/create', data),

  getPaymentStatus: (transactionId: string) =>
    apiService.get(`/payments/${transactionId}/status`),

  getPaymentMethods: () => apiService.get('/payments/methods'),

  getPaymentHistory: (params?: any) => apiService.get('/payments/history', { params }),
};

// FEL API service (deprecated - use felService.ts instead)
// Kept for backward compatibility
export const felServiceLegacy = {
  validateNIT: (nit: string) => apiService.post('/fel/validate-nit', { nit }),

  validateCUI: (cui: string) => apiService.post('/fel/validate-cui', { cui }),

  authenticate: (certifier: string) => apiService.post('/fel/authenticate', { certifier }),

  certifyDTE: (invoiceId: number) => apiService.post('/fel/certify-dte', { invoiceId }),

  cancelDTE: (data: any) => apiService.post('/fel/cancel-dte', data),

  consultDTE: (uuid: string) => apiService.get(`/fel/consult-dte/${uuid}`),

  downloadPDF: (uuid: string) => api.get(`/fel/download-pdf/${uuid}`, { responseType: 'blob' }),

  autoGenerate: (registrationId: number) =>
    apiService.post(`/fel/auto-generate/${registrationId}`),

  getTokenStatus: () => apiService.get('/fel/token/status'),

  refreshToken: () => apiService.post('/fel/token/refresh'),
};

// Certificates API service
// Maintained for backward compatibility - enhanced version in certificateService.ts
export const certificatesService = {
  getCertificates: (params?: any) => apiService.get('/certificates', { params }),

  getCertificate: (id: number) => apiService.get(`/certificates/${id}`),

  downloadCertificate: (id: number) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),

  verifyCertificate: (hash: string) => apiService.get(`/certificates/verify/${hash}`),

  getTemplates: () => apiService.get('/certificate-templates'),
};

// Users API service
export const usersService = {
  getUsers: (params?: any) => apiService.get('/users', { params }),

  getUser: (id: number) => apiService.get(`/users/${id}`),

  updateUser: (id: number, data: any) => apiService.put(`/users/${id}`, data),

  deleteUser: (id: number) => apiService.delete(`/users/${id}`),

  getProfile: () => apiService.get('/users/profile'),

  updateProfile: (data: any) => apiService.put('/users/profile', data),
};

// Admin API service
export const adminService = {
  // Dashboard stats
  getDashboard: async () => {
    // Obtener estadísticas desde múltiples endpoints
    const [events, users] = await Promise.all([
      apiService.get('/events'),
      apiService.get('/users')
    ]);

    // Calcular estadísticas
    return {
      success: true,
      data: {
        totalEvents: events.data?.pagination?.total || 0,
        activeEvents: events.data?.events?.filter((e: any) => e.isPublished).length || 0,
        totalUsers: users.data?.pagination?.total || 0,
        totalRevenue: 0, // TODO: Implementar cuando exista endpoint de pagos
        monthlyRevenue: 0,
        newRegistrations: 0,
      }
    };
  },

  // Events management
  getEvents: (params?: any) => apiService.get('/events', { params }),

  createEvent: (data: any) => apiService.post('/events', data),

  updateEvent: (id: number, data: any) => apiService.put(`/events/${id}`, data),

  deleteEvent: (id: number) => apiService.delete(`/events/${id}`),

  publishEvent: (id: number) => apiService.post(`/events/${id}/publish`),

  // Users management
  getUsers: (params?: any) => apiService.get('/users', { params }),

  createUser: (data: any) => apiService.post('/users', data),

  updateUser: (id: number, data: any) => apiService.put(`/users/${id}`, data),

  deleteUser: (id: number) => apiService.delete(`/users/${id}`),

  // Reports (using existing endpoints)
  getReports: async (params?: any) => {
    const events = await apiService.get('/events', { params });
    return events;
  },

  // Settings
  getSettings: () => apiService.get('/admin/settings'),

  updateSettings: (data: any) => apiService.put('/admin/settings', data),
};

export default api;