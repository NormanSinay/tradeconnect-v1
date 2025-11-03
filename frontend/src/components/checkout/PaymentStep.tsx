import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wallet } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle,
  Banknote
} from 'lucide-react';
import { CheckoutData, CheckoutService } from '@/services/checkoutService';

interface PaymentStepProps {
  checkoutData: CheckoutData;
  sessionId: string | null;
  onSubmit: (data: { paymentMethod: CheckoutData['paymentMethod'] }) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ checkoutData, sessionId, onSubmit }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutData['paymentMethod']>('paypal');
  const [loading, setLoading] = useState(false);
  const [paypalConfig, setPaypalConfig] = useState<any>(null);
  const [stripeConfig, setStripeConfig] = useState<any>(null);

  const paymentMethods = [
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pago seguro con PayPal',
      icon: Wallet,
      color: 'text-blue-600',
      available: true
    },
    {
      id: 'stripe',
      name: 'Tarjeta de Crédito/Débito',
      description: 'Visa, MasterCard, American Express',
      icon: CreditCard,
      color: 'text-purple-600',
      available: true
    },
    {
      id: 'neonet',
      name: 'NeoNet',
      description: 'Pago electrónico guatemalteco',
      icon: Banknote,
      color: 'text-green-600',
      available: true
    },
    {
      id: 'bam',
      name: 'BAM',
      description: 'Banco Agromercantil',
      icon: Shield,
      color: 'text-orange-600',
      available: true
    }
  ];

  // Load payment configurations
  useEffect(() => {
    const loadPaymentConfigs = async () => {
      try {
        const [paypal, stripe] = await Promise.all([
          CheckoutService.getPayPalConfig().catch(() => null),
          CheckoutService.getStripeConfig().catch(() => null)
        ]);

        setPaypalConfig(paypal);
        setStripeConfig(stripe);
      } catch (error) {
        // Silently fail - payment methods will still show
      }
    };

    loadPaymentConfigs();
  }, []);

  const handlePaymentSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit({ paymentMethod: selectedPaymentMethod });
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const total = CheckoutService.calculateTotal(checkoutData.items);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Método de Pago
        </h2>
        <p className="text-gray-600">
          Selecciona cómo deseas realizar el pago
        </p>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Resumen de la Orden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checkoutData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium">{item.eventTitle}</p>
                  <p className="text-sm text-gray-600">{item.accessTypeName}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.total)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <p className="text-lg font-bold">Total a Pagar</p>
              <p className="text-2xl font-bold text-[#6B1E22]">{formatCurrency(total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedPaymentMethod}
            onValueChange={(value: string) => setSelectedPaymentMethod(value as CheckoutData['paymentMethod'])}
            className="space-y-4"
          >
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div key={method.id} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    disabled={!method.available}
                  />
                  <Label
                    htmlFor={method.id}
                    className={`flex-1 cursor-pointer ${
                      !method.available ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Card className={`p-4 transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'ring-2 ring-[#6B1E22] bg-[#6B1E22]/5'
                        : 'hover:shadow-md'
                    } ${!method.available ? 'bg-gray-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <IconComponent className={`w-8 h-8 ${method.color}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                          {!method.available && (
                            <p className="text-xs text-red-600 mt-1">Temporalmente no disponible</p>
                          )}
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="w-5 h-5 text-[#6B1E22]" />
                        )}
                      </div>
                    </Card>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Pago Seguro:</strong> Todas las transacciones están protegidas con encriptación SSL de 256 bits.
          Tus datos de pago nunca se almacenan en nuestros servidores.
        </AlertDescription>
      </Alert>

      {/* Payment Processing Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Procesamiento:</strong> Una vez confirmado el pago, recibirás inmediatamente tu código QR de acceso
          y comprobante de inscripción por correo electrónico.
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handlePaymentSubmit}
          disabled={loading || !selectedPaymentMethod}
          className="bg-[#6B1E22] hover:bg-[#8a2b30] px-8"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Proceder al Pago - {formatCurrency(total)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentStep;