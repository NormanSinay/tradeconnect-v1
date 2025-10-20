import React, { Suspense } from 'react'
import { useLazyComponent } from '@/hooks/useLazyLoad'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

interface LazyComponentProps {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  loadingComponent?: React.ReactNode
  retryOnError?: boolean
  componentProps?: Record<string, any>
}

const DefaultLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm text-muted-foreground">Cargando...</span>
    </div>
  </div>
)

const DefaultErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <Alert variant="destructive" className="m-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between">
      <span>Error al cargar el componente: {error.message}</span>
      <Button variant="outline" size="sm" onClick={retry}>
        <RefreshCw className="h-3 w-3 mr-1" />
        Reintentar
      </Button>
    </AlertDescription>
  </Alert>
)

export const LazyComponent: React.FC<LazyComponentProps> = ({
  importFunc,
  fallback,
  errorFallback,
  loadingComponent = <DefaultLoadingComponent />,
  retryOnError = true,
  componentProps = {}
}) => {
  const { Component, isLoading, error, retry } = useLazyComponent({
    factory: importFunc,
    fallback,
    errorFallback
  })

  const handleRetry = () => {
    retry()
  }

  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    console.error('Lazy component error:', error, errorInfo)

    // Could send error to monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'exception', {
        description: `Lazy component error: ${error.message}`,
        fatal: false
      })
    }
  }

  if (isLoading) {
    return <>{loadingComponent}</>
  }

  if (error) {
    const ErrorComponent = errorFallback || (
      <DefaultErrorComponent error={error} retry={retryOnError ? handleRetry : () => {}} />
    )
    return <>{ErrorComponent}</>
  }

  if (!Component) {
    return <>{loadingComponent}</>
  }

  return (
    <Suspense fallback={loadingComponent}>
      <Component {...componentProps} />
    </Suspense>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: Omit<LazyComponentProps, 'importFunc' | 'componentProps'> = {}
) {
  return React.forwardRef<any, P>((props, ref) => (
    <LazyComponent
      importFunc={importFunc}
      componentProps={{ ...props, ref }}
      {...options}
    />
  ))
}

// Utility for dynamic imports with preloading
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  let loadedComponent: T | null = null
  let loadingPromise: Promise<{ default: T }> | null = null

  const loadComponent = async (): Promise<{ default: T }> => {
    if (loadedComponent) {
      return { default: loadedComponent }
    }

    if (loadingPromise) {
      return loadingPromise
    }

    loadingPromise = importFunc()
    const module = await loadingPromise
    loadedComponent = module.default

    return module
  }

  const preload = () => {
    if (!loadingPromise) {
      loadingPromise = importFunc()
    }
  }

  const LazyWrapper: React.FC<React.ComponentProps<T>> & { preload: () => void } = (props) => (
    <LazyComponent
      importFunc={loadComponent}
      componentProps={props}
    />
  )

  LazyWrapper.preload = preload

  return LazyWrapper
}

export default LazyComponent