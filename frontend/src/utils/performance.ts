// Performance monitoring utilities for React/Astro architecture
// Compatible with: React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui → Tailwind CSS → Radix UI → React Icons

export const performanceUtils = {
  // Measure Core Web Vitals
  measureCoreWebVitals: () => {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        console.log('LCP:', lastEntry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  },

  // Image optimization
  optimizeImage: (src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;

    // Add query parameters for optimization
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);

    return `${src}?${params.toString()}`;
  },

  // Monitor network requests
  monitorNetworkRequests: () => {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            console.log('Network request:', {
              url: entry.name,
              duration: entry.duration,
              size: entry.transferSize,
            });
          }
        });
      }).observe({ entryTypes: ['resource'] });
    }
  },

  // Log bundle size
  logBundleSize: () => {
    if (import.meta.env.DEV) {
      // Log bundle size in development
      console.log('Bundle analysis available in production build');
    }
  },

  // Monitor memory usage
  monitorMemoryUsage: () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('Memory usage:', {
        used: Math.round(memInfo.usedJSHeapSize / 1048576 * 100) / 100 + ' MB',
        total: Math.round(memInfo.totalJSHeapSize / 1048576 * 100) / 100 + ' MB',
        limit: Math.round(memInfo.jsHeapSizeLimit / 1048576 * 100) / 100 + ' MB',
      });
    }
  },
};

// Service Worker registration for PWA (Astro-compatible)
export const registerServiceWorker = () => {
  // Check if running in browser environment (Astro SSR compatibility)
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  // Register service worker for caching and offline support
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered for PWA:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, notify user
              console.log('New content available, please refresh.');
            }
          });
        }
      });
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
};

// Preload critical resources (optimized for Astro SSR)
export const preloadCriticalResources = () => {
  // Check if running in browser environment (Astro SSR compatibility)
  if (typeof document === 'undefined') return;

  // Preload critical fonts (Inter & Montserrat for Tailwind/shadcn)
  const fontLinks = [
    { href: '/fonts/inter-regular.woff2', family: 'Inter' },
    { href: '/fonts/montserrat-regular.woff2', family: 'Montserrat' },
  ];

  fontLinks.forEach(({ href, family }) => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = href;
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
  });

  // Preload critical images (optimized for TradeConnect)
  const criticalImages = [
    '/images/hero-bg.webp',
    '/images/logo-tradeconnect.webp',
  ];

  criticalImages.forEach(href => {
    const imageLink = document.createElement('link');
    imageLink.rel = 'preload';
    imageLink.href = href;
    imageLink.as = 'image';
    document.head.appendChild(imageLink);
  });
};

// Intersection Observer for lazy loading (React/Astro optimized)
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  // Check if running in browser environment (Astro SSR compatibility)
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null; // Return null for SSR
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px', // Pre-load before entering viewport
    threshold: 0.1, // Trigger when 10% visible
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cache utilities
export const cacheUtils = {
  // Simple in-memory cache
  memoryCache: new Map<string, { data: any; timestamp: number; ttl: number }>(),

  set: (key: string, data: any, ttl = 5 * 60 * 1000) => { // 5 minutes default
    cacheUtils.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },

  get: (key: string) => {
    const item = cacheUtils.memoryCache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      cacheUtils.memoryCache.delete(key);
      return null;
    }

    return item.data;
  },

  clear: () => {
    cacheUtils.memoryCache.clear();
  },
};

// Error boundary performance monitoring (React/Astro compatible)
export const logError = (error: Error, errorInfo?: any) => {
  // Enhanced error logging for React/Astro architecture
  const errorContext = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    errorInfo,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    environment: import.meta.env.MODE,
  };

  console.error('Application Error:', errorContext);

  // In production, send to error reporting service
  if (import.meta.env.PROD) {
    // Example: send to Sentry, LogRocket, etc.
    // errorReportingService.captureException(error, { extra: errorContext });
  }
};

// Performance marks and measures
export const performanceMarks = {
  start: (name: string) => {
    if ('performance' in window && performance.mark) {
      performance.mark(`${name}-start`);
    }
  },

  end: (name: string) => {
    if ('performance' in window && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];
        if (measure) {
          console.log(`${name} duration:`, measure.duration);
        }
      } catch (error) {
        console.warn('Performance measure failed:', error);
      }
    }
  },
};
