import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Chip,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { EVENT_TYPES, EVENT_CATEGORIES, CURRENCIES } from '@/utils/constants';
import { securityUtils } from '@/utils/security';

// Validation schema
const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required('El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .test('no-html', 'El título no puede contener HTML', (value) => !/<[^>]*>/.test(value || '')),
  description: yup
    .string()
    .required('La descripción es requerida')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  shortDescription: yup
    .string()
    .max(300, 'La descripción corta no puede exceder 300 caracteres'),
  eventTypeId: yup
    .number()
    .required('El tipo de evento es requerido')
    .oneOf(Object.values(EVENT_TYPES), 'Tipo de evento inválido'),
  eventCategoryId: yup
    .number()
    .required('La categoría es requerida')
    .oneOf(Object.values(EVENT_CATEGORIES), 'Categoría inválida'),
  startDate: yup
    .date()
    .required('La fecha de inicio es requerida')
    .min(new Date(), 'La fecha de inicio debe ser futura'),
  endDate: yup
    .date()
    .required('La fecha de fin es requerida')
    .min(yup.ref('startDate'), 'La fecha de fin debe ser posterior a la fecha de inicio'),
  location: yup
    .string()
    .max(200, 'La ubicación no puede exceder 200 caracteres'),
  virtualLocation: yup
    .string()
    .max(500, 'La ubicación virtual no puede exceder 500 caracteres'),
  capacity: yup
    .number()
    .required('La capacidad es requerida')
    .min(1, 'La capacidad debe ser al menos 1')
    .max(10000, 'La capacidad no puede exceder 10,000'),
  price: yup
    .number()
    .required('El precio es requerido')
    .min(0, 'El precio no puede ser negativo')
    .max(100000, 'El precio no puede exceder Q100,000'),
  currency: yup
    .string()
    .required('La moneda es requerida')
    .oneOf(Object.values(CURRENCIES), 'Moneda inválida'),
  isPublished: yup.boolean(),
  requiresApproval: yup.boolean(),
  allowWaitlist: yup.boolean(),
  maxTicketsPerUser: yup
    .number()
    .min(1, 'Debe permitir al menos 1 ticket por usuario')
    .max(10, 'No puede exceder 10 tickets por usuario'),
});

const steps = ['Información Básica', 'Detalles del Evento', 'Configuración'];

interface EventFormWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

const EventFormWizard: React.FC<EventFormWizardProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      eventTypeId: '',
      eventCategoryId: '',
      startDate: null,
      endDate: null,
      location: '',
      virtualLocation: '',
      capacity: 50,
      price: 0,
      currency: 'GTQ',
      isPublished: false,
      requiresApproval: false,
      allowWaitlist: true,
      maxTicketsPerUser: 5,
      ...initialData,
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      reset({
        title: '',
        description: '',
        shortDescription: '',
        eventTypeId: '',
        eventCategoryId: '',
        startDate: null,
        endDate: null,
        location: '',
        virtualLocation: '',
        capacity: 50,
        price: 0,
        currency: 'GTQ',
        isPublished: false,
        requiresApproval: false,
        allowWaitlist: true,
        maxTicketsPerUser: 5,
        ...initialData,
      });
      setActiveStep(0);
    }
  }, [open, initialData, reset]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Sanitize input data
      const sanitizedData = {
        ...data,
        title: securityUtils.sanitizeInput(data.title),
        description: securityUtils.sanitizeHTML(data.description),
        shortDescription: data.shortDescription ? securityUtils.sanitizeInput(data.shortDescription) : undefined,
        location: data.location ? securityUtils.sanitizeInput(data.location) : undefined,
        virtualLocation: data.virtualLocation ? securityUtils.sanitizeInput(data.virtualLocation) : undefined,
      };

      await onSave(sanitizedData);
      toast.success(isEditing ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente');
      onClose();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedFields = watch();

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Información Básica
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Título del Evento *"
                    error={!!errors.title}
                    helperText={typeof errors.title?.message === 'string' ? errors.title.message : undefined}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            {field.value?.length || 0}/100
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="shortDescription"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Descripción Corta"
                    multiline
                    rows={2}
                    error={!!errors.shortDescription}
                    helperText={typeof errors.shortDescription?.message === 'string' ? errors.shortDescription.message : 'Breve resumen del evento (opcional)'}
                    inputProps={{ maxLength: 300 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            {field.value?.length || 0}/300
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Descripción Completa *"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={typeof errors.description?.message === 'string' ? errors.description.message : undefined}
                    inputProps={{ maxLength: 2000 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">
                            {field.value?.length || 0}/2000
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="eventTypeId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.eventTypeId}>
                    <InputLabel>Tipo de Evento *</InputLabel>
                    <Select {...field} label="Tipo de Evento *">
                      {Object.entries(EVENT_TYPES).map(([key, value]) => (
                        <MenuItem key={value} value={value}>
                          {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.eventTypeId && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {typeof errors.eventTypeId?.message === 'string' ? errors.eventTypeId.message : 'Tipo de evento requerido'}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="eventCategoryId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.eventCategoryId}>
                    <InputLabel>Categoría *</InputLabel>
                    <Select {...field} label="Categoría *">
                      {Object.entries(EVENT_CATEGORIES).map(([key, value]) => (
                        <MenuItem key={value} value={value}>
                          {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.eventCategoryId && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {typeof errors.eventCategoryId?.message === 'string' ? errors.eventCategoryId.message : 'Categoría requerida'}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );

      case 1: // Detalles del Evento
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Fecha y Hora de Inicio *"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: typeof errors.startDate?.message === 'string' ? errors.startDate.message : undefined,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Fecha y Hora de Fin *"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: typeof errors.endDate?.message === 'string' ? errors.endDate.message : undefined,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ubicación Física"
                      error={!!errors.location}
                      helperText={typeof errors.location?.message === 'string' ? errors.location.message : 'Dirección completa del evento'}
                      inputProps={{ maxLength: 200 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="virtualLocation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ubicación Virtual"
                      error={!!errors.virtualLocation}
                      helperText={typeof errors.virtualLocation?.message === 'string' ? errors.virtualLocation.message : 'Enlace de Zoom, Meet, etc.'}
                      inputProps={{ maxLength: 500 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="capacity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Capacidad Máxima *"
                      error={!!errors.capacity}
                      helperText={typeof errors.capacity?.message === 'string' ? errors.capacity.message : undefined}
                      inputProps={{ min: 1, max: 10000 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="maxTicketsPerUser"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Máximo de Tickets por Usuario"
                      error={!!errors.maxTicketsPerUser}
                      helperText={typeof errors.maxTicketsPerUser?.message === 'string' ? errors.maxTicketsPerUser.message : 'Límite de tickets que puede comprar un usuario'}
                      inputProps={{ min: 1, max: 10 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 2: // Configuración
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Precio *"
                    error={!!errors.price}
                    helperText={typeof errors.price?.message === 'string' ? errors.price.message : undefined}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.currency}>
                    <InputLabel>Moneda *</InputLabel>
                    <Select {...field} label="Moneda *">
                      {Object.entries(CURRENCIES).map(([key, value]) => (
                        <MenuItem key={value} value={value}>
                          {key} ({value})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.currency && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {typeof errors.currency?.message === 'string' ? errors.currency.message : 'Moneda requerida'}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Publicar evento inmediatamente"
                      labelPlacement="start"
                      sx={{ ml: 0, justifyContent: 'space-between' }}
                    />
                  )}
                />

                <Controller
                  name="requiresApproval"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Requiere aprobación manual de registros"
                      labelPlacement="start"
                      sx={{ ml: 0, justifyContent: 'space-between' }}
                    />
                  )}
                />

                <Controller
                  name="allowWaitlist"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Permitir lista de espera cuando se agote la capacidad"
                      labelPlacement="start"
                      sx={{ ml: 0, justifyContent: 'space-between' }}
                    />
                  )}
                />
              </Box>
            </Grid>

            {watchedFields.price === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Este evento es gratuito. Los usuarios podrán registrarse sin costo.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {watchedFields.requiresApproval && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    Los registros requerirán aprobación manual. Esto puede aumentar el tiempo de procesamiento.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>
        {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </DialogTitle>

      <DialogContent>
        <Box component="div" sx={{ width: '100%', mt: 2 } as any}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>

        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isSubmitting}>
            Anterior
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isValid || isSubmitting}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Evento' : 'Crear Evento'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventFormWizard;
