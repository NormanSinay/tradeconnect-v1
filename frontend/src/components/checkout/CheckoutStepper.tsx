import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckoutStep = 'information' | 'payment' | 'confirmation';

interface CheckoutStepperProps {
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
}

const steps: { id: CheckoutStep; label: string }[] = [
  { id: 'information', label: 'Información' },
  { id: 'payment', label: 'Pago' },
  { id: 'confirmation', label: 'Confirmación' },
];

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  activeStep,
  completedSteps,
}) => {
  const getStepIndex = (step: CheckoutStep): number => {
    return steps.findIndex((s) => s.id === step);
  };

  const currentStepIndex = getStepIndex(activeStep);

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = step.id === activeStep;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 mb-2',
                  isCompleted
                    ? 'bg-green-600'
                    : isActive
                    ? 'bg-primary'
                    : 'bg-gray-300'
                )}
              >
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
              </div>

              {/* Step Label */}
              <div
                className={cn(
                  'text-center text-sm',
                  isCompleted
                    ? 'font-medium text-green-600'
                    : isActive
                    ? 'font-bold text-primary'
                    : 'text-gray-500'
                )}
              >
                {step.label}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'hidden md:block h-0.5 w-full mt-4',
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutStepper;
