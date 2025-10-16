import React from 'react';
import { Stepper, Step, StepLabel, Box, useTheme, useMediaQuery } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStepIndex = (step: CheckoutStep): number => {
    return steps.findIndex((s) => s.id === step);
  };

  const currentStepIndex = getStepIndex(activeStep);

  return (
    <Box component={"div" as any} sx={{ width: '100%', mb: 4 }}>
      <Stepper
        activeStep={currentStepIndex}
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{
          '& .MuiStepLabel-root .Mui-completed': {
            color: 'success.main',
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: 'primary.main',
          },
          '& .MuiStepLabel-label.Mui-completed': {
            fontWeight: 'medium',
          },
          '& .MuiStepLabel-label.Mui-active': {
            fontWeight: 'bold',
            color: 'primary.main',
          },
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = step.id === activeStep;

          return (
            <Step key={step.id} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    component={"div" as any}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isCompleted
                        ? 'success.main'
                        : isActive
                        ? 'primary.main'
                        : 'grey.300',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isCompleted ? <CheckCircle /> : index + 1}
                  </Box>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default CheckoutStepper;
