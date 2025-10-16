import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  Chip,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { PAYMENT_GATEWAYS } from '@/utils/constants';

export type PaymentMethod = 'stripe' | 'paypal' | 'neonet' | 'bam';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  available: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'stripe',
    name: 'Tarjeta de Crédito/Débito',
    description: 'Visa, Mastercard, American Express',
    icon: <CreditCard sx={{ fontSize: 40 }} />,
    badge: 'Más usado',
    available: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pago rápido con tu cuenta PayPal',
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    available: true,
  },
  {
    id: 'neonet',
    name: 'NeoNet Guatemala',
    description: 'Pasarela local para Guatemala',
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    available: true,
  },
  {
    id: 'bam',
    name: 'BAM Pagos',
    description: 'Sistema de pagos BAM',
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    available: true,
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethod;
  onMethodChange?: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  const [selected, setSelected] = useState<PaymentMethod | undefined>(
    selectedMethod
  );

  const handleMethodChange = (method: PaymentMethod) => {
    setSelected(method);
    if (onMethodChange) {
      onMethodChange(method);
    }
  };

  return (
    <Box component={"div" as any} sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Método de Pago
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Seleccione su método de pago preferido. Todos los pagos son procesados de forma segura.
      </Alert>

      <Grid container spacing={2}>
        {paymentMethods.map((method) => (
          <Grid item xs={12} sm={6} key={method.id}>
            <Card
              onClick={() => method.available && handleMethodChange(method.id)}
              sx={{
                cursor: method.available ? 'pointer' : 'not-allowed',
                opacity: method.available ? 1 : 0.5,
                border: 2,
                borderColor:
                  selected === method.id ? 'primary.main' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': method.available
                  ? {
                      borderColor: 'primary.light',
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    }
                  : {},
                position: 'relative',
              }}
            >
              <CardContent>
                {/* Radio Button */}
                <Box
                  component={"div" as any}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                  }}
                >
                  <Radio
                    checked={selected === method.id}
                    disabled={!method.available}
                    sx={{
                      '& .MuiSvgIcon-root': {
                        fontSize: 28,
                      },
                    }}
                  />
                </Box>

                {/* Badge */}
                {method.badge && (
                  <Box component={"div" as any} sx={{ mb: 1 }}>
                    <Chip
                      label={method.badge}
                      size="small"
                      color="primary"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                )}

                {/* Icon */}
                <Box
                  component={"div" as any}
                  sx={{
                    color: selected === method.id ? 'primary.main' : 'text.secondary',
                    mb: 2,
                  }}
                >
                  {method.icon}
                </Box>

                {/* Name */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: selected === method.id ? 'primary.main' : 'text.primary',
                  }}
                >
                  {method.name}
                </Typography>

                {/* Description */}
                <Typography variant="body2" color="text.secondary">
                  {method.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Security Note */}
      <Alert severity="success" icon={<CreditCard />} sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Pago Seguro:</strong> Todos los pagos son procesados con
          encriptación SSL/TLS. No almacenamos información de tarjetas de crédito.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PaymentMethodSelector;
