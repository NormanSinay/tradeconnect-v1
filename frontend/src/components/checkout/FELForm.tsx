import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { felService } from '@/services/felService';
import { VALIDATION_RULES } from '@/utils/constants';
import { cn } from '@/lib/utils';

// Validation schema
const nitSchema = yup.object({
  documentType: yup.string().required('Tipo de documento requerido'),
  nit: yup.string().when('documentType', {
    is: 'nit',
    then: (schema) => schema
      .required('NIT es requerido')
      .matches(
        VALIDATION_RULES.NIT.GUATEMALA_REGEX,
        'Formato de NIT inválido (ej: 1234-567890-123-4)'
      ),
  }),
  cui: yup.string().when('documentType', {
    is: 'cui',
    then: (schema) => schema
      .required('CUI es requerido')
      .matches(
        VALIDATION_RULES.CUI.GUATEMALA_REGEX,
        'CUI debe tener 13 dígitos'
      ),
  }),
  fiscalName: yup.string().required('Nombre fiscal es requerido'),
  fiscalAddress: yup.string().required('Dirección fiscal es requerida'),
});

export interface FELFormData {
  documentType: 'nit' | 'cui';
  nit?: string;
  cui?: string;
  fiscalName: string;
  fiscalAddress: string;
}

interface FELFormProps {
  onDataChange?: (data: FELFormData) => void;
  initialData?: Partial<FELFormData>;
}

const FELForm: React.FC<FELFormProps> = ({ onDataChange, initialData }) => {
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const {
    control,
    watch,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<FELFormData>({
    resolver: yupResolver(nitSchema) as any,
    defaultValues: {
      documentType: initialData?.documentType || 'nit',
      nit: initialData?.nit || '',
      cui: initialData?.cui || '',
      fiscalName: initialData?.fiscalName || '',
      fiscalAddress: initialData?.fiscalAddress || '',
    },
    mode: 'onBlur',
  });

  const documentType = watch('documentType');
  const nitValue = watch('nit');
  const cuiValue = watch('cui');

  // Auto-format NIT/CUI on change
  useEffect(() => {
    if (documentType === 'nit' && nitValue) {
      const formatted = felService.formatNit(nitValue);
      if (formatted !== nitValue) {
        setValue('nit', formatted);
      }
    } else if (documentType === 'cui' && cuiValue) {
      const formatted = felService.formatCui(cuiValue);
      if (formatted !== cuiValue) {
        setValue('cui', formatted);
      }
    }
  }, [nitValue, cuiValue, documentType, setValue]);

  // Notify parent of data changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (onDataChange) {
        onDataChange(value as FELFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const handleValidateDocument = async () => {
    setValidating(true);
    setValidationStatus(null);

    try {
      if (documentType === 'nit') {
        const nit = getValues('nit');
        if (!nit) {
          setValidationStatus({
            isValid: false,
            message: 'Ingrese un NIT para validar',
            type: 'error',
          });
          return;
        }

        const result = await felService.validateNit(nit);

        if (result.success && result.data) {
          setValue('fiscalName', result.data.name);
          if (result.data.address) {
            setValue('fiscalAddress', result.data.address);
          }

          setValidationStatus({
            isValid: true,
            message: `✓ NIT válido: ${result.data.name}`,
            type: 'success',
          });
        } else {
          setValidationStatus({
            isValid: false,
            message: result.message || 'NIT no válido o no encontrado',
            type: 'error',
          });
        }
      } else if (documentType === 'cui') {
        const cui = getValues('cui');
        if (!cui) {
          setValidationStatus({
            isValid: false,
            message: 'Ingrese un CUI para validar',
            type: 'error',
          });
          return;
        }

        const result = await felService.validateCui(cui);

        if (result.success && result.data) {
          setValue('fiscalName', result.data.name);

          setValidationStatus({
            isValid: true,
            message: `✓ CUI válido: ${result.data.name}`,
            type: 'success',
          });
        } else {
          setValidationStatus({
            isValid: false,
            message: result.message || 'CUI no válido o no encontrado',
            type: 'error',
          });
        }
      }
    } catch (error) {
      setValidationStatus({
        isValid: false,
        message: 'Error al validar el documento. Intente nuevamente.',
        type: 'error',
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <Box component={"div" as any} sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Información de Facturación FEL Guatemala
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Ingrese sus datos fiscales para la generación de factura electrónica FEL
      </Alert>

      {/* Document Type Selector */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Tipo de Documento
        </Typography>
        <Controller
          name="documentType"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel
                value="nit"
                control={<Radio />}
                label="NIT (Empresa)"
              />
              <FormControlLabel
                value="cui"
                control={<Radio />}
                label="CUI (Consumidor Final)"
              />
            </RadioGroup>
          )}
        />
      </FormControl>

      {/* NIT Input */}
      {documentType === 'nit' && (
        <Controller
          name="nit"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="NIT *"
              placeholder="1234-567890-123-4"
              error={!!errors.nit}
              helperText={errors.nit?.message || 'Formato: XXXX-XXXXXX-XXX-X'}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleValidateDocument}
                      disabled={validating || !!errors.nit}
                      edge="end"
                      color="primary"
                    >
                      {validating ? (
                        <CircularProgress size={20} />
                      ) : validationStatus?.isValid ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Search />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      )}

      {/* CUI Input */}
      {documentType === 'cui' && (
        <Controller
          name="cui"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="CUI *"
              placeholder="1234567890123"
              error={!!errors.cui}
              helperText={errors.cui?.message || '13 dígitos'}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleValidateDocument}
                      disabled={validating || !!errors.cui}
                      edge="end"
                      color="primary"
                    >
                      {validating ? (
                        <CircularProgress size={20} />
                      ) : validationStatus?.isValid ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Search />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      )}

      {/* Validation Status */}
      {validationStatus && (
        <Alert
          severity={validationStatus.type}
          icon={validationStatus.isValid ? <CheckCircle /> : <ErrorIcon />}
          sx={{ mb: 2 }}
        >
          {validationStatus.message}
        </Alert>
      )}

      {/* Fiscal Name */}
      <Controller
        name="fiscalName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Nombre Fiscal *"
            placeholder="Nombre o razón social"
            error={!!errors.fiscalName}
            helperText={errors.fiscalName?.message}
            sx={{ mb: 2 }}
            disabled={validating}
          />
        )}
      />

      {/* Fiscal Address */}
      <Controller
        name="fiscalAddress"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            rows={2}
            label="Dirección Fiscal *"
            placeholder="Dirección completa para factura"
            error={!!errors.fiscalAddress}
            helperText={errors.fiscalAddress?.message}
            sx={{ mb: 2 }}
            disabled={validating}
          />
        )}
      />

      <Alert severity="warning" icon={<ErrorIcon />}>
        <Typography variant="body2">
          <strong>Importante:</strong> Verifique que los datos sean correctos. La factura
          electrónica FEL no puede modificarse una vez emitida.
        </Typography>
      </Alert>
    </Box>
  );
};

export default FELForm;
