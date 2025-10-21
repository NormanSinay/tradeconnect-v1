import React, { useEffect } from 'react'

interface WebhookHandlerProps {
  provider?: string
}

const WebhookHandler: React.FC<WebhookHandlerProps> = ({ provider }) => {
  useEffect(() => {
    // Handle webhook processing
    console.log('Processing webhook for provider:', provider)

    // This component handles webhook callbacks from payment providers
    // The actual logic would be implemented here
  }, [provider])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Procesando Webhook</h1>
        <p className="text-gray-600">Procesando callback de pago automáticamente...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

export default WebhookHandler