import { useState, useEffect, useRef, useCallback } from 'react'

interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface LazyLoadReturn {
  ref: React.RefObject<HTMLElement>
  isIntersecting: boolean
  hasIntersected: boolean
}

export const useLazyLoad = (options: LazyLoadOptions = {}): LazyLoadReturn => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries

    if (entry?.isIntersecting) {
      setIsIntersecting(true)
      setHasIntersected(true)

      // If triggerOnce is true, unobserve after first intersection
      if (triggerOnce && ref.current) {
        observer.current?.unobserve(ref.current)
      }
    } else if (!triggerOnce) {
      setIsIntersecting(false)
    }
  }, [triggerOnce])

  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!ref.current) return

    observer.current = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
    })

    observer.current.observe(ref.current)

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [callback, threshold, rootMargin])

  return { ref, isIntersecting, hasIntersected }
}

// Hook for lazy loading images with blur placeholder
interface LazyImageOptions extends LazyLoadOptions {
  src: string
  placeholder?: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

interface LazyImageReturn extends LazyLoadReturn {
  src: string
  isLoaded: boolean
  hasError: boolean
  imgRef: React.RefObject<HTMLImageElement>
}

export const useLazyImage = (options: LazyImageOptions): LazyImageReturn => {
  const { src, onLoad, onError } = options
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const { ref, isIntersecting, hasIntersected } = useLazyLoad(options)

  useEffect(() => {
    if (!isIntersecting || !imgRef.current) return

    const img = imgRef.current

    const handleLoad = () => {
      setIsLoaded(true)
      onLoad?.()
    }

    const handleError = () => {
      setHasError(true)
      onError?.()
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)

    // Set src to trigger loading
    if (img.src !== src) {
      img.src = src
    }

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
    }
  }, [isIntersecting, src, onLoad, onError])

  return {
    ref,
    isIntersecting,
    hasIntersected,
    src,
    isLoaded,
    hasError,
    imgRef
  }
}

// Hook for lazy loading components
interface LazyComponentOptions {
  factory: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

interface LazyComponentReturn {
  Component: React.ComponentType<any> | null
  isLoading: boolean
  error: Error | null
  retry: () => void
}

export const useLazyComponent = (options: LazyComponentOptions): LazyComponentReturn => {
  const { factory, fallback, errorFallback } = options
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = useCallback(async () => {
    if (Component || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const module = await factory()
      setComponent(() => module.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [Component, isLoading, factory])

  const retry = useCallback(() => {
    setComponent(null)
    setError(null)
    loadComponent()
  }, [loadComponent])

  useEffect(() => {
    loadComponent()
  }, [loadComponent])

  // Return appropriate component based on state
  if (error && errorFallback) {
    return {
      Component: () => errorFallback as React.ReactElement,
      isLoading: false,
      error,
      retry
    }
  }

  if (isLoading && fallback) {
    return {
      Component: () => fallback as React.ReactElement,
      isLoading,
      error: null,
      retry
    }
  }

  return {
    Component,
    isLoading,
    error,
    retry
  }
}

// Hook for virtual scrolling
interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  items: any[]
  overscan?: number
}

interface VirtualScrollReturn {
  visibleItems: any[]
  offsetY: number
  containerRef: React.RefObject<HTMLDivElement>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

export const useVirtualScroll = (options: VirtualScrollOptions): VirtualScrollReturn => {
  const { itemHeight, containerHeight, items, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2)

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    offsetY,
    containerRef,
    onScroll
  }
}

// Hook for debounced search/input
interface DebounceOptions {
  delay: number
  initialValue?: string
}

interface DebounceReturn {
  value: string
  debouncedValue: string
  onChange: (value: string) => void
  isDebouncing: boolean
}

export const useDebounce = (options: DebounceOptions): DebounceReturn => {
  const { delay, initialValue = '' } = options
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [isDebouncing, setIsDebouncing] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout>()

  const onChange = useCallback((newValue: string) => {
    setValue(newValue)
    setIsDebouncing(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue)
      setIsDebouncing(false)
    }, delay)
  }, [delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    value,
    debouncedValue,
    onChange,
    isDebouncing
  }
}