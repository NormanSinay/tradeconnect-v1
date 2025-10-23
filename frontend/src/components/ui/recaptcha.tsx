import { useEffect, useRef, useCallback } from 'react'

interface ReCAPTCHAComponentProps {
  siteKey: string
  onVerify?: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
  action?: string
  className?: string
}

declare global {
  interface Window {
    grecaptcha: any
    onRecaptchaLoad: () => void
  }
}

const ReCAPTCHAComponent: React.FC<ReCAPTCHAComponentProps> = ({
  siteKey,
  onVerify,
  onError,
  action = 'submit',
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isExecutingRef = useRef(false)

  const executeReCAPTCHA = useCallback(async () => {
    if (isExecutingRef.current || !window.grecaptcha) return

    try {
      isExecutingRef.current = true
      const token = await window.grecaptcha.execute(siteKey, { action })
      if (onVerify) {
        onVerify(token)
      }
    } catch (error) {
      console.error('reCAPTCHA execution error:', error)
      if (onError) {
        onError()
      }
    } finally {
      isExecutingRef.current = false
    }
  }, [siteKey, action, onVerify, onError])

  useEffect(() => {
    const loadReCAPTCHA = () => {
      if (window.grecaptcha && window.grecaptcha.execute) {
        // reCAPTCHA v3 is loaded, execute immediately
        executeReCAPTCHA()
      } else {
        // Load reCAPTCHA v3 script
        if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
          window.onRecaptchaLoad = () => {
            executeReCAPTCHA()
          }

          const script = document.createElement('script')
          script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
          script.async = true
          script.defer = true
          document.head.appendChild(script)
        } else {
          // Script already loaded, execute
          executeReCAPTCHA()
        }
      }
    }

    loadReCAPTCHA()
  }, [siteKey, executeReCAPTCHA])

  // Re-execute when action changes
  useEffect(() => {
    if (window.grecaptcha && window.grecaptcha.execute) {
      executeReCAPTCHA()
    }
  }, [action, executeReCAPTCHA])

  return (
    <div ref={containerRef} className={className} style={{ display: 'none' }}>
      {/* Invisible reCAPTCHA v3 - no visible element needed */}
    </div>
  )
}

export default ReCAPTCHAComponent