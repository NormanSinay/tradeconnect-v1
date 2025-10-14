// Performance monitoring utilities
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

  // Bundle size monitoring
  logBundleSize: () => {
    if (import.meta.env.DEV) {
      // Log bundle size in development
      import('vite-bundle-analyzer').then(({ analyzeBundle }) => {
        console.log('Bundle analysis available');
      }).catch(() => {
        console.log('Bundle analyzer not available');
      });
    }
  },

  // Memory usage monitoring
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

  // Network monitoring
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
};

// Service Worker registration for PWA
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    // Simple service worker registration for basic caching
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Service Worker registered:', registration);
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/roboto-regular.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const heroImage = document.createElement('link');
  heroImage.rel = 'preload';
  heroImage.href = '/images/hero-bg.webp';
  heroImage.as = 'image';
  document.head.appendChild(heroImage);
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
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

// Error boundary performance monitoring
export const logError = (error: Error, errorInfo?: any) => {
  console.error('Application Error:', error, errorInfo);

  // In production, send to error reporting service
  if (import.meta.env.PROD) {
    // Example: send to Sentry, LogRocket, etc.
    // errorReportingService.captureException(error, { extra: errorInfo });
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