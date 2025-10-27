import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'

// Extend window interface for Turnstile
declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: any) => string
      reset: (widgetId: string) => void
      execute: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string
      isExpired: (widgetId: string) => boolean
    }
  }
}

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onExpired?: () => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'flexible' | 'compact'
  className?: string
  execution?: 'render' | 'execute'
  appearance?: 'always' | 'execute' | 'interaction-only'
}

export interface TurnstileRef {
  reset: () => void
  execute: () => void
  remove: () => void
  getResponse: () => string | undefined
  isExpired: () => boolean
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  ({
    siteKey,
    onVerify,
    onExpired,
    onError,
    theme = 'light',
    size = 'normal',
    className = '',
    execution = 'render',
    appearance = 'always'
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    // Use refs to store callbacks - prevents re-renders when callbacks change
    const onVerifyRef = useRef(onVerify)
    const onExpiredRef = useRef(onExpired)
    const onErrorRef = useRef(onError)

    // Update refs when callbacks change (doesn't trigger re-render)
    useEffect(() => {
      onVerifyRef.current = onVerify
    }, [onVerify])

    useEffect(() => {
      onExpiredRef.current = onExpired
    }, [onExpired])

    useEffect(() => {
      onErrorRef.current = onError
    }, [onError])

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
      execute: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.execute(widgetIdRef.current)
        }
      },
      remove: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
      },
      getResponse: () => {
        if (widgetIdRef.current && window.turnstile) {
          return window.turnstile.getResponse(widgetIdRef.current)
        }
        return undefined
      },
      isExpired: () => {
        if (widgetIdRef.current && window.turnstile) {
          return window.turnstile.isExpired(widgetIdRef.current)
        }
        return false
      }
    }))

    useEffect(() => {
      // Load Turnstile script if not already loaded
      const loadTurnstile = () => {
        // Poll for window.turnstile to be available
        const checkTurnstile = () => {
          if (window.turnstile) {
            console.log('✅ window.turnstile está disponible')
            setIsLoaded(true)
          } else {
            console.log('⏳ Esperando a que window.turnstile esté disponible...')
            setTimeout(checkTurnstile, 100)
          }
        }

        if (!document.querySelector('script[src*="challenges.cloudflare.com"]')) {
          console.log('🔄 Cargando script de Cloudflare Turnstile...')
          const script = document.createElement('script')
          script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`
          script.async = true
          script.defer = true
          script.onload = () => {
            console.log('✅ Script de Turnstile cargado exitosamente')
            checkTurnstile()
          }
          script.onerror = () => {
            console.error('❌ Error al cargar el script de Turnstile')
          }
          document.head.appendChild(script)
        } else {
          console.log('✅ Script de Turnstile ya está cargado')
          checkTurnstile()
        }
      }

      loadTurnstile()

      return () => {
        // Cleanup
        if (widgetIdRef.current && window.turnstile) {
          console.log('🧹 Limpiando widget de Turnstile')
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
      }
    }, [])

    useEffect(() => {
      console.log('🔍 Verificando condiciones para renderizar:', {
        isLoaded,
        hasTurnstile: !!window.turnstile,
        hasContainer: !!containerRef.current,
        hasWidgetId: !!widgetIdRef.current,
        siteKey
      })

      if (isLoaded && window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          console.log('🎨 Renderizando widget de Turnstile...')
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            size,
            execution,
            appearance,
            callback: (token: string) => {
              console.log('✅ Token de Turnstile recibido:', token.substring(0, 20) + '...')
              onVerifyRef.current(token)
            },
            'expired-callback': () => {
              console.log('⏰ Token de Turnstile expirado')
              onExpiredRef.current?.()
            },
            'error-callback': () => {
              console.error('❌ Error en Turnstile')
              onErrorRef.current?.()
            }
          })
          console.log('✅ Widget de Turnstile renderizado con ID:', widgetIdRef.current)
        } catch (error) {
          console.error('❌ Error rendering Turnstile widget:', error)
          onErrorRef.current?.()
        }
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current)
          } catch (error) {
            console.error('Error removing Turnstile widget:', error)
          }
          widgetIdRef.current = null
        }
      }
    }, [isLoaded, siteKey, theme, size, execution, appearance])

    return (
      <div
        ref={containerRef}
        className={`turnstile-container ${className}`}
        style={{ minHeight: size === 'compact' ? '65px' : size === 'flexible' ? 'auto' : '78px' }}
      />
    )
  }
)

Turnstile.displayName = 'Turnstile'

export default Turnstile