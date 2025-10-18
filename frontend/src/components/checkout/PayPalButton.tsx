import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalButtonProps {
  amount: number;
  currency?: 'USD' | 'GTQ';
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
}) => {
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get PayPal client ID from environment
    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!paypalClientId) {
      setError('PayPal no está configurado correctamente');
      setLoading(false);
      return;
    }

    setClientId(paypalClientId);
    setLoading(false);
  }, []);

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toFixed(2),
            currency_code: currency,
          },
          description: 'Pago de evento TradeConnect',
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    });
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      onSuccess(details);
    } catch (err) {
      onError(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientId) {
    return (
      <Alert className="mb-4">
        <AlertDescription>PayPal no está disponible en este momento</AlertDescription>
      </Alert>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: currency,
        intent: 'capture',
      }}
    >
      <div className="min-h-52">
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            console.error('PayPal error:', err);
            onError(err);
          }}
          onCancel={() => {
            if (onCancel) onCancel();
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
