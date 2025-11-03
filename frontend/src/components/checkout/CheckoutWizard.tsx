import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import { CheckoutData, CheckoutService, AccessType } from '@/services/checkoutService';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { UserService } from '@/services/userService';
import AccessTypeComparison from './AccessTypeComparison';
import PersonalInfoStep from './PersonalInfoStep';
import PaymentStep from './PaymentStep';
import ConfirmationStep from './ConfirmationStep';

interface CheckoutWizardProps {
  eventId: number;
  eventTitle: string;
  onComplete: (result: any) => void;
  onCancel: () => void;
}

type CheckoutStep = 'access-type' | 'personal-info' | 'payment' | 'confirmation';

const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
  eventId,
  eventTitle,
  onComplete,
  onCancel
}) => {
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('access-type');
  const [accessTypes, setAccessTypes] = useState<AccessType[]>([]);
  const [selectedAccessType, setSelectedAccessType] = useState<AccessType | null>(null);
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const steps = [
    { id: 'access-type', title: 'Tipo de Acceso', description: 'Selecciona tu entrada' },
    { id: 'personal-info', title: 'Información Personal', description: 'Datos requeridos' },
    { id: 'payment', title: 'Pago', description: 'Método de pago' },
    { id: 'confirmation', title: 'Confirmación', description: 'Finalizar compra' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Load access types on mount
  useEffect(() => {
    const loadAccessTypes = async () => {
      try {
        setLoading(true);
        const types = await CheckoutService.getEventAccessTypes(eventId);
        setAccessTypes(types);

        // Auto-select first available type if only one exists
        const availableTypes = types.filter(type => type.available);
        if (availableTypes.length === 1) {
          setSelectedAccessType(availableTypes[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando tipos de acceso');
      } finally {
        setLoading(false);
      }
    };

    loadAccessTypes();
  }, [eventId]);

  // Pre-fill personal info from user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await UserService.getProfile();
        setCheckoutData(prev => ({
          ...prev,
          personalInfo: {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            nit: profile.nit || '',
            cui: profile.cui || ''
          }
        }));
      } catch (err) {
        // Silently fail - user can fill manually
      }
    };

    if (user && currentStep === 'personal-info') {
      loadUserProfile();
    }
  }, [user, currentStep]);

  const handleAccessTypeSelect = (accessType: AccessType) => {
    setSelectedAccessType(accessType);
    setCheckoutData(prev => ({
      ...prev,
      items: [{
        eventId,
        eventTitle,
        accessTypeId: accessType.id,
        accessTypeName: accessType.name,
        quantity: 1,
        price: accessType.price,
        total: accessType.price
      }]
    }));
  };

  const handlePersonalInfoSubmit = (personalInfo: CheckoutData['personalInfo']) => {
    setCheckoutData(prev => ({ ...prev, personalInfo }));
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (paymentData: { paymentMethod: CheckoutData['paymentMethod'] }) => {
    try {
      setLoading(true);
      setError(null);

      const completeCheckoutData: CheckoutData = {
        personalInfo: checkoutData.personalInfo!,
        items: checkoutData.items!,
        paymentMethod: paymentData.paymentMethod
      };

      // Validate checkout data
      const validation = CheckoutService.validateCheckoutData(completeCheckoutData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Create checkout session
      const session = await CheckoutService.createCheckoutSession(completeCheckoutData);
      setSessionId(session.sessionId);

      setCheckoutData(prev => ({ ...prev, paymentMethod: paymentData.paymentMethod }));
      setCurrentStep('confirmation');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando pago');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!sessionId) {
        throw new Error('Sesión de checkout no encontrada');
      }

      // Confirm checkout
      const result = await CheckoutService.confirmCheckout(sessionId);

      // Clear cart and complete
      clearCart();
      onComplete(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error confirmando compra');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (sessionId) {
      try {
        await CheckoutService.cancelCheckout(sessionId);
      } catch (err) {
        // Silently fail
      }
    }
    onCancel();
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'access-type':
        return selectedAccessType !== null;
      case 'personal-info':
        return checkoutData.personalInfo &&
               checkoutData.personalInfo.firstName &&
               checkoutData.personalInfo.lastName &&
               checkoutData.personalInfo.email &&
               checkoutData.personalInfo.phone;
      case 'payment':
        return checkoutData.paymentMethod;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextStepIndex].id as CheckoutStep);
  };

  const handlePrevious = () => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(steps[prevStepIndex].id as CheckoutStep);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'access-type':
        return (
          <AccessTypeComparison
            accessTypes={accessTypes}
            selectedTypeId={selectedAccessType?.id}
            onSelectType={handleAccessTypeSelect}
            eventTitle={eventTitle}
          />
        );

      case 'personal-info':
        return (
          <PersonalInfoStep
            initialData={checkoutData.personalInfo}
            onSubmit={handlePersonalInfoSubmit}
          />
        );

      case 'payment':
        return (
          <PaymentStep
            checkoutData={checkoutData as CheckoutData}
            sessionId={sessionId}
            onSubmit={handlePaymentSubmit}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationStep
            checkoutData={checkoutData as CheckoutData}
            onConfirm={handleConfirmation}
          />
        );

      default:
        return null;
    }
  };

  if (loading && !accessTypes.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index <= currentStepIndex
                  ? 'bg-[#6B1E22] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index < currentStepIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  index <= currentStepIndex ? 'text-[#6B1E22]' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  index < currentStepIndex ? 'bg-[#6B1E22]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStepIndex].title}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCurrentStep()}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStepIndex === 0 ? handleCancel : handlePrevious}
          disabled={loading}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStepIndex === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {currentStep !== 'confirmation' && (
          <Button
            onClick={handleNext}
            disabled={!canProceedToNext() || loading}
            className="bg-[#6B1E22] hover:bg-[#8a2b30]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
};

export default CheckoutWizard;