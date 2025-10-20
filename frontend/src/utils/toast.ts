import toast from 'react-hot-toast'

export const showToast = {
  success: (message: string, options?: { duration?: number }) => {
    return toast.success(message, {
      duration: options?.duration || 4000,
    })
  },

  error: (message: string, options?: { duration?: number }) => {
    return toast.error(message, {
      duration: options?.duration || 5000,
    })
  },

  warning: (message: string, options?: { duration?: number }) => {
    return toast(message, {
      duration: options?.duration || 4000,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
    })
  },

  info: (message: string, options?: { duration?: number }) => {
    return toast(message, {
      duration: options?.duration || 4000,
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#6B7280',
        color: '#fff',
      },
    })
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  },

  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: {
      successDuration?: number
      errorDuration?: number
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }, {
      success: {
        duration: options?.successDuration || 3000,
      },
      error: {
        duration: options?.errorDuration || 5000,
      },
    })
  },
}

// Export toast library for direct access if needed
export { toast }