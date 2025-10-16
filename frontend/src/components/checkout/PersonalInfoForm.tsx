import React, { useEffect } from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { VALIDATION_RULES } from '@/utils/constants';

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
    <Box component={"div" as any} sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Información Personal
      </Typography>

      <Grid container spacing={2}>
        {/* First Name */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Nombre *"
                placeholder="Juan"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />
        </Grid>

        {/* Last Name */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Apellido *"
                placeholder="Pérez"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="email"
                label="Email *"
                placeholder="juan.perez@example.com"
                error={!!errors.email}
                helperText={
                  errors.email?.message ||
                  'Se enviará confirmación a este correo'
                }
              />
            )}
          />
        </Grid>

        {/* Phone */}
        <Grid item xs={12}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Teléfono *"
                placeholder="+502 1234-5678"
                error={!!errors.phone}
                helperText={
                  errors.phone?.message || 'Formato: +502 XXXX-XXXX'
                }
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalInfoForm;
