import { toast } from 'react-hot-toast';

// Toast hooks for React/Astro architecture
// Compatible with: React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui → Tailwind CSS → Radix UI → React Icons

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  style?: React.CSSProperties;
  className?: string;
  icon?: string;
  iconTheme?: {
    primary: string;
    secondary: string;
  };
}

export const useToast = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    // SSR-safe: only show toast on client-side
    if (typeof window === 'undefined') return null;

    return toast.success(message, {
      duration: 5000,
      icon: '✅',
      ...options,
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    // SSR-safe: only show toast on client-side
    if (typeof window === 'undefined') return null;

    return toast.error(message, {
      duration: 7000,
      icon: '❌',
      ...options,
    });
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    // SSR-safe: only show toast on client-side
    if (typeof window === 'undefined') return null;

    return toast(message, {
      duration: 6000,
      icon: '⚠️',
      style: {
        background: '#ff9800',
        color: '#ffffff',
        border: '1px solid #f57c00',
      },
      ...options,
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    // SSR-safe: only show toast on client-side
    if (typeof window === 'undefined') return null;

    return toast(message, {
      duration: 5000,
      icon: 'ℹ️',
      style: {
        background: '#2196f3',
        color: '#ffffff',
        border: '1px solid #1976d2',
      },
      ...options,
    });
  };

  const showLoading = (message: string, options?: ToastOptions) => {
    // SSR-safe: only show toast on client-side
    if (typeof window === 'undefined') return null;

    return toast.loading(message, {
      style: {
        background: '#2196f3',
        color: '#ffffff',
        border: '1px solid #1976d2',
      },
      ...options,
    });
  };

  const updateToast = (toastId: string, message: string, type: 'success' | 'error' | 'warning' | 'info' | 'loading') => {
    // SSR-safe: only update toast on client-side
    if (typeof window === 'undefined') return;

    switch (type) {
      case 'success':
        toast.success(message, { id: toastId });
        break;
      case 'error':
        toast.error(message, { id: toastId });
        break;
      case 'warning':
        toast(message, {
          id: toastId,
          icon: '⚠️',
          style: {
            background: '#ff9800',
            color: '#ffffff',
            border: '1px solid #f57c00',
          },
        });
        break;
      case 'info':
        toast(message, {
          id: toastId,
          icon: 'ℹ️',
          style: {
            background: '#2196f3',
            color: '#ffffff',
            border: '1px solid #1976d2',
          },
        });
        break;
      case 'loading':
        toast.loading(message, { id: toastId });
        break;
    }
  };

  const dismissToast = (toastId?: string) => {
    // SSR-safe: only dismiss toast on client-side
    if (typeof window === 'undefined') return;

    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const dismissAllToasts = () => {
    // SSR-safe: only dismiss toasts on client-side
    if (typeof window === 'undefined') return;

    toast.dismiss();
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateToast,
    dismissToast,
    dismissAllToasts,
  };
};