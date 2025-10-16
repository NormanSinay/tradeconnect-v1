import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  InputAdornment,
  Typography,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import { CreditCard, Lock } from '@mui/icons-material';
import { useFormContext, Controller } from 'react-hook-form';

const CreditCardForm: React.FC = () => {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const cardNumber = watch('cardNumber') || '';

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Detect card type
  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'American Express';
    return 'Tarjeta';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Box component={"div" as any}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CreditCard />
        Información de Tarjeta de Crédito
      </Typography>

      <Grid container spacing={3}>
        {/* Card Number */}
        <Grid item xs={12}>
          <Controller
            name="cardNumber"
            control={control}
            defaultValue=""
            rules={{
              required: 'El número de tarjeta es requerido',
              pattern: {
                value: /^[\d\s]{13,19}$/,
                message: 'Número de tarjeta inválido',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                label="Número de Tarjeta"
                value={value}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  onChange(formatted);
                }}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber?.message as string}
                placeholder="1234 5678 9012 3456"
                inputProps={{ maxLength: 19 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCard />
                    </InputAdornment>
                  ),
                  endAdornment: cardNumber && (
                    <InputAdornment position="end">
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {getCardType(cardNumber)}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Cardholder Name */}
        <Grid item xs={12}>
          <TextField
            {...register('holderName', {
              required: 'El nombre del titular es requerido',
              pattern: {
                value: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Solo se permiten letras',
              },
            })}
            fullWidth
            label="Nombre del Titular"
            placeholder="Como aparece en la tarjeta"
            error={!!errors.holderName}
            helperText={errors.holderName?.message as string}
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />
        </Grid>

        {/* Expiry Month */}
        <Grid item xs={4}>
          <FormControl fullWidth error={!!errors.expiryMonth}>
            <InputLabel>Mes</InputLabel>
            <Controller
              name="expiryMonth"
              control={control}
              defaultValue=""
              rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <Select {...field} label="Mes">
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month.toString().padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.expiryMonth && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.expiryMonth.message as string}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Expiry Year */}
        <Grid item xs={4}>
          <FormControl fullWidth error={!!errors.expiryYear}>
            <InputLabel>Año</InputLabel>
            <Controller
              name="expiryYear"
              control={control}
              defaultValue=""
              rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <Select {...field} label="Año">
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.expiryYear && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.expiryYear.message as string}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* CVV */}
        <Grid item xs={4}>
          <TextField
            {...register('cvv', {
              required: 'CVV requerido',
              pattern: {
                value: /^[0-9]{3,4}$/,
                message: '3-4 dígitos',
              },
            })}
            fullWidth
            label="CVV"
            type="password"
            placeholder="123"
            error={!!errors.cvv}
            helperText={errors.cvv?.message as string}
            inputProps={{ maxLength: 4 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Lock sx={{ fontSize: 16 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Security Notice */}
        <Grid item xs={12}>
          <Box
            component={"div" as any}
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
            }}
          >
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock sx={{ fontSize: 14 }} />
              Tu información está protegida con encriptación SSL de 256 bits
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreditCardForm;
