import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
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
      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!clientId) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        PayPal no está disponible en este momento
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
      <Box component={"div" as any} sx={{ minHeight: 200 }}>
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
      </Box>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
