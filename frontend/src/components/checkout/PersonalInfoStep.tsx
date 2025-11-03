import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, FileText, CreditCard } from 'lucide-react';
import { CheckoutData } from '@/services/checkoutService';

interface PersonalInfoStepProps {
  initialData?: CheckoutData['personalInfo'];
  onSubmit: (data: CheckoutData['personalInfo']) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<CheckoutData['personalInfo']>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    nit: initialData?.nit || '',
    cui: initialData?.cui || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Apellido es requerido';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email no es válido';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Teléfono es requerido';
    } else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CheckoutData['personalInfo']) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información Personal
        </h2>
        <p className="text-gray-600">
          Completa tus datos para procesar la inscripción
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <User className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Esta información es necesaria para generar tu comprobante fiscal y código QR de acceso.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre *
            </Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              className={errors.firstName ? 'border-red-500' : ''}
              placeholder="Ingresa tu nombre"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Apellido *
            </Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              className={errors.lastName ? 'border-red-500' : ''}
              placeholder="Ingresa tu apellido"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo Electrónico *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Teléfono *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              className={errors.phone ? 'border-red-500' : ''}
              placeholder="+502 1234 5678"
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* NIT */}
          <div className="space-y-2">
            <Label htmlFor="nit" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              NIT (Opcional)
            </Label>
            <Input
              id="nit"
              type="text"
              value={formData.nit}
              onChange={handleInputChange('nit')}
              placeholder="12345678-9"
            />
            <p className="text-xs text-gray-500">
              Requerido para facturación electrónica
            </p>
          </div>

          {/* CUI */}
          <div className="space-y-2">
            <Label htmlFor="cui" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              CUI (Opcional)
            </Label>
            <Input
              id="cui"
              type="text"
              value={formData.cui}
              onChange={handleInputChange('cui')}
              placeholder="1234567890123"
            />
            <p className="text-xs text-gray-500">
              Documento de identificación personal
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button
            type="submit"
            className="bg-[#6B1E22] hover:bg-[#8a2b30] px-8"
          >
            Continuar al Pago
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoStep;