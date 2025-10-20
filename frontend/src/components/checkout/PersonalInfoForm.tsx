/**
 * @fileoverview PersonalInfoForm - Formulario de información personal para checkout
 * @description Componente React para captura de datos personales en proceso de pago
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks y state management
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Validación completa con Yup y React Hook Form
 * - Notificación automática de cambios a componentes padre
 * - Diseño responsive con Tailwind CSS
 * - Compatibilidad SSR con Astro
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { VALIDATION_RULES } from '@/utils/constants';
import { cn } from '@/lib/utils';

// Validation schema
const personalInfoSchema = yup.object({
  firstName: yup.string().required('Nombre es requerido'),
  lastName: yup.string().required('Apellido es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  phone: yup
    .string()
    .required('Teléfono es requerido')
    .matches(
      VALIDATION_RULES.PHONE.GUATEMALA_REGEX,
      'Formato: +502 XXXX-XXXX'
    ),
});

export interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PersonalInfoFormProps {
  onDataChange?: (data: PersonalInfoFormData) => void;
  onValidChange?: (isValid: boolean) => void;
  initialData?: Partial<PersonalInfoFormData>;
}

/**
 * PersonalInfoForm - Formulario de información personal para checkout
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  onDataChange,
  onValidChange,
  initialData,
}) => {
  const {
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<PersonalInfoFormData>({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
    },
    mode: 'onBlur',
  });

  // Notify parent of data changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (onDataChange) {
        onDataChange(value as PersonalInfoFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidChange) {
      onValidChange(isValid);
    }
  }, [isValid, onValidChange]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-primary mb-4">
        Información Personal
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre *</Label>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="firstName"
                placeholder="Juan"
                className={cn(errors.firstName && 'border-red-500')}
              />
            )}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido *</Label>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="lastName"
                placeholder="Pérez"
                className={cn(errors.lastName && 'border-red-500')}
              />
            )}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email *</Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="juan.perez@example.com"
                className={cn(errors.email && 'border-red-500')}
              />
            )}
          />
          {errors.email ? (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Se enviará confirmación a este correo
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="phone"
                placeholder="+502 1234-5678"
                className={cn(errors.phone && 'border-red-500')}
              />
            )}
          />
          {errors.phone ? (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Formato: +502 XXXX-XXXX
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
