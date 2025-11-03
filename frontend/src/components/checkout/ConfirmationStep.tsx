import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  QrCode,
  Download,
  Mail,
  Calendar,
  CreditCard,
  Shield,
  Check
} from 'lucide-react';
import { CheckoutData } from '@/services/checkoutService';

interface ConfirmationStepProps {
  checkoutData: CheckoutData;
  onConfirm: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ checkoutData, onConfirm }) => {
  const [processingStep, setProcessingStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const processingSteps = [
    'Validando pago...',
    'Generando código QR...',
    'Creando inscripción...',
    'Enviando confirmación...'
  ];

  const handleConfirm = async () => {
    setIsProcessing(true);

    // Simulate processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    onConfirm();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const total = checkoutData.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirmar Compra
        </h2>
        <p className="text-gray-600">
          Revisa los detalles y confirma tu inscripción
        </p>
      </div>

      {/* Processing Animation */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6B1E22] rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Procesando tu compra...
          </h3>
          <p className="text-gray-600 mb-4">{processingSteps[processingStep]}</p>
          <Progress
            value={((processingStep + 1) / processingSteps.length) * 100}
            className="w-full max-w-md mx-auto"
          />
        </motion.div>
      )}

      {!isProcessing && (
        <>
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Resumen Final de la Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Detalles del Evento</h4>
                {checkoutData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-gray-700">{item.eventTitle}</span>
                    <span className="font-medium">{item.accessTypeName}</span>
                  </div>
                ))}
              </div>

              {/* Personal Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Información Personal</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <br />
                    <span className="font-medium">
                      {checkoutData.personalInfo.firstName} {checkoutData.personalInfo.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <br />
                    <span className="font-medium">{checkoutData.personalInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Teléfono:</span>
                    <br />
                    <span className="font-medium">{checkoutData.personalInfo.phone}</span>
                  </div>
                  {checkoutData.personalInfo.nit && (
                    <div>
                      <span className="text-gray-600">NIT:</span>
                      <br />
                      <span className="font-medium">{checkoutData.personalInfo.nit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Método de Pago</h4>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="capitalize font-medium">
                    {checkoutData.paymentMethod === 'paypal' && 'PayPal'}
                    {checkoutData.paymentMethod === 'stripe' && 'Tarjeta de Crédito/Débito'}
                    {checkoutData.paymentMethod === 'neonet' && 'NeoNet'}
                    {checkoutData.paymentMethod === 'bam' && 'BAM'}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-[#6B1E22]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What happens next */}
          <Card>
            <CardHeader>
              <CardTitle>¿Qué sucede después?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#6B1E22] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pago procesado</p>
                    <p className="text-sm text-gray-600">
                      Tu pago será procesado de forma segura
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#6B1E22] rounded-full flex items-center justify-center">
                    <QrCode className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Código QR generado</p>
                    <p className="text-sm text-gray-600">
                      Recibirás inmediatamente tu código QR de acceso
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#6B1E22] rounded-full flex items-center justify-center">
                    <Mail className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmación por email</p>
                    <p className="text-sm text-gray-600">
                      Recibirás todos los detalles en tu correo electrónico
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#6B1E22] rounded-full flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Acceso al evento</p>
                    <p className="text-sm text-gray-600">
                      Podrás acceder al evento con tu código QR
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Compra Segura:</strong> Esta transacción está protegida y puedes cancelar
              hasta 24 horas antes del evento según nuestras políticas de reembolso.
            </AlertDescription>
          </Alert>

          {/* Confirm Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleConfirm}
              className="bg-[#6B1E22] hover:bg-[#8a2b30] px-12 py-3 text-lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar y Finalizar Compra
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfirmationStep;