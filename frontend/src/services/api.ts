import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse, ApiError } from '@/types'
import { rateLimiter, sanitizeFormData, generateCSRFToken } from '@/utils/security'
import { showToast } from '@/utils/toast'

// Base API configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  private axiosInstance: AxiosInstance
  private csrfToken: string | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
    this.initializeSecurity()
  }

  private initializeSecurity() {
    // Generate initial CSRF token
    this.csrfToken = generateCSRFToken()
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Rate limiting check
        if (!rateLimiter.isAllowed('api')) {
          const remainingTime = Math.ceil(rateLimiter.getRemainingAttempts('api') / 60)
          showToast.error(`Demasiadas solicitudes. Intenta de nuevo en ${remainingTime} minutos.`)
          return Promise.reject(new Error('Rate limit exceeded'))
        }

        // Add auth token if available
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add CSRF token for state-changing requests
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
          if (!this.csrfToken) {
            this.csrfToken = generateCSRFToken()
          }
          config.headers['X-CSRF-Token'] = this.csrfToken
        }

        // Add language header
        const language = localStorage.getItem('language') || 'es'
        config.headers['Accept-Language'] = language

        // Add security headers
        config.headers['X-Requested-With'] = 'XMLHttpRequest'
        config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0'

        // Sanitize request data
        if (config.data && typeof config.data === 'object') {
          config.data = sanitizeFormData(config.data)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Validate CSRF token in response if present
        if (response.headers['x-csrf-token']) {
          this.csrfToken = response.headers['x-csrf-token']
        }

        return response
      },
      (error) => {
        // Enhanced error handling with security considerations
        if (error.response?.status === 401) {
          // Token expired or invalid - clear sensitive data
          this.clearStorage()
          showToast.error('Sesión expirada. Por favor inicia sesión nuevamente.')
          window.location.href = '/login'
        }

        if (error.response?.status === 403) {
          // Forbidden - could be CSRF or permissions
          if (error.response.data?.code === 'CSRF_INVALID') {
            // Regenerate CSRF token and retry once
            this.csrfToken = generateCSRFToken()
            showToast.warning('Error de seguridad. Reintentando...')
            // Could implement retry logic here
          } else {
            showToast.error('No tienes permisos para esta acción.')
            window.location.href = '/unauthorized'
          }
        }

        if (error.response?.status === 429) {
          // Rate limited
          const retryAfter = error.response.headers['retry-after']
          showToast.error(`Demasiadas solicitudes. Espera ${retryAfter || 60} segundos.`)
        }

        if (error.response?.status >= 500) {
          // Server error - log but don't expose sensitive info
          console.error('Server error:', {
            status: error.response.status,
            url: error.config?.url,
            method: error.config?.method,
            timestamp: new Date().toISOString()
          })
          showToast.error('Error del servidor. Intenta de nuevo más tarde.')
        }

        // Network errors
        if (!error.response) {
          showToast.error('Error de conexión. Verifica tu conexión a internet.')
        }

        return Promise.reject(error)
      }
    )
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.get(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.post(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.put(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.patch(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.delete(url, config)
  }

  // Secure file upload method with validation
  async uploadFile<T>(
    url: string,
    file: File,
    fieldName = 'file',
    validationOptions?: {
      maxSize?: number
      allowedTypes?: string[]
      allowedExtensions?: string[]
    }
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    // Import validation function
    const { validateFileUpload } = await import('@/utils/security')

    // Validate file if options provided
    if (validationOptions) {
      const validation = validateFileUpload(file, validationOptions)
      if (!validation.isValid) {
        return Promise.reject(new Error(validation.error))
      }
    }

    const formData = new FormData()
    formData.append(fieldName, file)

    // Add security headers for file uploads
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-File-Name': encodeURIComponent(file.name),
        'X-File-Size': file.size.toString(),
        'X-File-Type': file.type,
      },
    }

    return this.axiosInstance.post(url, formData, config)
  }

  // Set auth token manually
  setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }

  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  // Clear all stored data with security
  clearStorage() {
    // Clear auth data
    localStorage.removeItem('authToken')
    localStorage.removeItem('userPreferences')

    // Clear CSRF token
    this.csrfToken = null

    // Clear any cached sensitive data
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('temp_') || key.startsWith('cache_')) {
        localStorage.removeItem(key)
      }
    })

    // Clear session storage as well
    sessionStorage.clear()
  }

  // Get current CSRF token
  getCsrfToken(): string | null {
    return this.csrfToken
  }

  // Regenerate CSRF token
  regenerateCsrfToken(): string {
    this.csrfToken = generateCSRFToken()
    return this.csrfToken
  }

  // Check if request is rate limited
  isRateLimited(endpoint: string): boolean {
    return !rateLimiter.isAllowed(endpoint)
  }

  // Get rate limit status
  getRateLimitStatus(endpoint: string): { allowed: boolean; remaining: number } {
    return {
      allowed: rateLimiter.isAllowed(endpoint),
      remaining: rateLimiter.getRemainingAttempts(endpoint)
    }
  }
}

// Create and export singleton instance
export const api = new ApiService()

// Export the class for testing purposes
export { ApiService }