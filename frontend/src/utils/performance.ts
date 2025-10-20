// Performance utilities for frontend optimization
import { useCallback, useEffect, useRef, useState } from 'react'

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()

    this.recordMetric(name, end - start)
    return result
  }

  // Record custom metric
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)

    // Keep only last 100 measurements
    const measurements = this.metrics.get(name)!
    if (measurements.length > 100) {
      measurements.shift()
    }
  }

  // Get metric statistics
  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(name)
    if (!measurements || measurements.length === 0) return null

    const sum = measurements.reduce((a, b) => a + b, 0)
    return {
      avg: sum / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    }
  }

  // Monitor Web Vitals
  monitorWebVitals(): void {
    // Web Vitals monitoring (would require web-vitals package)
    // For now, we'll use basic Performance API
    if ('PerformanceObserver' in window) {
      // Monitor LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry) {
          this.recordWebVital('LCP', lastEntry.startTime)
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // Monitor FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordWebVital('FID', (entry as any).processingStart - entry.startTime)
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)
    }
  }

  private recordWebVital(name: string, value: number): void {
    this.recordMetric(`web-vital-${name}`, value)

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'web_vitals', {
        name,
        value: Math.round(value * 1000) / 1000,
        event_category: 'Web Vitals'
      })
    }
  }

  // Monitor long tasks
  monitorLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.recordMetric('long-task', entry.duration)
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
      this.observers.push(observer)
    }
  }

  // Get all metrics
  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {}
    for (const [name, measurements] of this.metrics.entries()) {
      result[name] = this.getMetricStats(name)
    }
    return result
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear()
  }

  // Cleanup
  destroy(): void {
    this.cleanupObservers()
    this.metrics.clear()
  }

  // Public method to cleanup observers
  cleanupObservers(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance()

  useEffect(() => {
    monitor.monitorWebVitals()
    monitor.monitorLongTasks()

    return () => {
      // Don't destroy on unmount, just cleanup observers
      monitor.cleanupObservers()
    }
  }, [])

  const measureFunction = useCallback(<T>(name: string, fn: () => T): T => {
    return monitor.measure(name, fn)
  }, [monitor])

  const recordMetric = useCallback((name: string, value: number) => {
    monitor.recordMetric(name, value)
  }, [monitor])

  const getMetrics = useCallback(() => monitor.getAllMetrics(), [monitor])

  return {
    measureFunction,
    recordMetric,
    getMetrics
  }
}

// Bundle analyzer hook
export const useBundleAnalyzer = () => {
  const [bundleSize, setBundleSize] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeBundle = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      // This would integrate with vite-bundle-analyzer or similar
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 1000))
      setBundleSize(Math.random() * 1000000) // Mock size
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return {
    bundleSize,
    isAnalyzing,
    analyzeBundle
  }
}

// Memory usage monitor
export const useMemoryMonitor = () => {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number
    total: number
    limit: number
  } | null>(null)

  const checkMemory = useCallback(() => {
    if ('memory' in performance) {
      const mem = (performance as any).memory
      setMemoryUsage({
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        limit: mem.jsHeapSizeLimit
      })
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(checkMemory, 5000)
    checkMemory() // Initial check

    return () => clearInterval(interval)
  }, [checkMemory])

  return memoryUsage
}

// Image optimization utilities
export const optimizeImage = {
  // Generate responsive image URLs
  generateResponsiveUrls: (baseUrl: string, widths: number[] = [320, 640, 1024, 1920]) => {
    return widths.map(width => ({
      width,
      url: `${baseUrl}?w=${width}&q=75&fm=webp`
    }))
  },

  // Preload critical images
  preloadCriticalImages: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  },

  // Lazy load with intersection observer
  createLazyImageLoader: () => {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
          }
        }
      })
    }, { rootMargin: '50px' })

    return {
      observe: (img: HTMLImageElement) => imageObserver.observe(img),
      disconnect: () => imageObserver.disconnect()
    }
  }
}

// Code splitting utilities
export const codeSplitting = {
  // Dynamic import with error handling
  loadComponent: async <T>(
    importFn: () => Promise<T>,
    fallback?: React.ComponentType
  ): Promise<T> => {
    try {
      return await importFn()
    } catch (error) {
      console.error('Failed to load component:', error)
      if (fallback) {
        return { default: fallback } as T
      }
      throw error
    }
  },

  // Preload route components
  preloadRoute: (route: string) => {
    // This would integrate with your router
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  }
}

// Cache utilities
export class CacheManager {
  private static instance: CacheManager
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 100

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  set(key: string, data: any, ttl = 300000): void { // 5 minutes default
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const cacheManager = CacheManager.getInstance()

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()