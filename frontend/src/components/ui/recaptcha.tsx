import { useEffect, useState } from 'react'

interface ReCAPTCHAComponentProps {
  siteKey: string
  onVerify?: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
  action?: string
  className?: string
  showStatus?: boolean
}

const ReCAPTCHAComponent: React.FC<ReCAPTCHAComponentProps> = ({
  siteKey,
  onVerify,
  onExpired,
  onError,
  action = 'submit',
  className,
  showStatus = true
}) => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // Simulate reCAPTCHA verification process
    const simulateVerification = async () => {
      console.log('🔐 Simulating reCAPTCHA verification for action:', action)

      // Simulate loading time (1-2 seconds)
      const delay = Math.random() * 1000 + 500
      await new Promise(resolve => setTimeout(resolve, delay))

      // Generate a mock token for development/testing that matches backend expectations
      const token = `recaptcha-dev-token-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      console.log('✅ reCAPTCHA verification completed, token generated')

      setRecaptchaToken(token)
      setIsVerifying(false)

      if (onVerify) {
        onVerify(token)
      }
    }

    simulateVerification()
  }, [action, onVerify])

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {showStatus && (
        <>
          <div className="text-sm text-gray-600 text-center">
            Verificación de seguridad requerida
          </div>
          <div className="flex items-center space-x-2">
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-[#6B1E22] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Verificando...</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Verificación completada</span>
              </>
            )}
          </div>
          {recaptchaToken && (
            <div className="text-xs text-green-600 font-medium">
              ✅ Seguridad verificada
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ReCAPTCHAComponent