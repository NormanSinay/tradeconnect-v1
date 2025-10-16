import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  InputAdornment,
  Autocomplete,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

interface EventFormData {
  // Basic Info
  title: string;
  category: string;
  type: string;
  modality: 'presencial' | 'virtual' | 'hibrido';

  // Details
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  virtualRoom?: string;

  // Media
  images: File[];
  imageUrls: string[];

  // Speakers
  speakers: Array<{ id: string; name: string; specialty: string }>;

  // Pricing
  price: number;
  capacity: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;

  // Publish
  status: 'draft' | 'published';
  featured: boolean;
}

interface EventFormWizardProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData, isDraft: boolean) => void;
  onCancel: () => void;
}

const steps = [
  'Información Básica',
  'Detalles',
  'Multimedia',
  'Speakers',
  'Precios',
  'Publicar',
];

const EventFormWizard: React.FC<EventFormWizardProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string[]>(initialData?.imageUrls || []);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      title: '',
      category: '',
      type: '',
      modality: 'presencial',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      images: [],
      imageUrls: [],
      speakers: [],
      price: 0,
      capacity: 100,
      status: 'draft',
      featured: false,
      ...initialData,
    },
  });

  const categories = [
    'Tecnología',
    'Negocios',
    'Marketing',
    'Finanzas',
    'Recursos Humanos',
    'Salud',
    'Legal',
  ];

  const eventTypes = [
    'Conferencia',
    'Workshop',
    'Seminario',
    'Webinar',
    'Curso',
    'Certificación',
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const currentImages = watch('images') || [];
      setValue('images', [...currentImages, ...fileArray]);

      // Create preview URLs
      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreview((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = watch('images') || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue('images', newImages);

    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImagePreview(newPreviews);
  };

  const handleAddSpeaker = () => {
    const currentSpeakers = watch('speakers') || [];
    setValue('speakers', [
      ...currentSpeakers,
      { id: Date.now().toString(), name: '', specialty: '' },
    ]);
  };

  const handleRemoveSpeaker = (index: number) => {
    const currentSpeakers = watch('speakers') || [];
    setValue('speakers', currentSpeakers.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (isDraft: boolean) => {
    handleSubmit((data) => {
      onSubmit({ ...data, status: isDraft ? 'draft' : 'published' }, isDraft);
    })();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'El título es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Título del Evento"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'La categoría es requerida' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Categoría</InputLabel>
                    <Select {...field} label="Categoría">
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'El tipo es requerido' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Tipo de Evento</InputLabel>
                    <Select {...field} label="Tipo de Evento">
                      {eventTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="modality"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Modalidad</InputLabel>
                    <Select {...field} label="Modalidad">
                      <MenuItem value="presencial">Presencial</MenuItem>
                      <MenuItem value="virtual">Virtual</MenuItem>
                      <MenuItem value="hibrido">Híbrido</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'La descripción es requerida' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={6}
                    label="Descripción"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: 'La fecha de inicio es requerida' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="datetime-local"
                    label="Fecha y Hora de Inicio"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: 'La fecha de fin es requerida' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="datetime-local"
                    label="Fecha y Hora de Fin"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
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
                    label="Ubicación"
                    placeholder="Dirección física del evento"
                  />
                )}
              />
            </Grid>
            {watch('modality') !== 'presencial' && (
              <Grid item xs={12}>
                <Controller
                  name="virtualRoom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Sala Virtual"
                      placeholder="URL de Zoom, Google Meet, etc."
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Box component={"div" as any}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Imágenes del Evento
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mb: 3 }}
            >
              Cargar Imágenes
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>

            <Grid container spacing={2}>
              {imagePreview.map((preview, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={preview}
                      alt={`Preview ${index + 1}`}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {index === 0 && (
                      <Chip
                        label="Principal"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                        }}
                      />
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box component={"div" as any}>
            <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Speakers</Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddSpeaker}>
                Agregar Speaker
              </Button>
            </Box>

            {watch('speakers')?.map((speaker, index) => (
              <Card key={speaker.id} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={speaker.name}
                      onChange={(e) => {
                        const speakers = watch('speakers');
                        if (speakers && speakers[index]) {
                          speakers[index].name = e.target.value;
                          setValue('speakers', speakers);
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Especialidad"
                      value={speaker.specialty}
                      onChange={(e) => {
                        const speakers = watch('speakers');
                        if (speakers && speakers[index]) {
                          speakers[index].specialty = e.target.value;
                          setValue('speakers', speakers);
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveSpeaker(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="price"
                control={control}
                rules={{ required: 'El precio es requerido', min: 0 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Precio"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="capacity"
                control={control}
                rules={{ required: 'La capacidad es requerida', min: 1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Capacidad"
                    error={!!errors.capacity}
                    helperText={errors.capacity?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="earlyBirdPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Precio Early Bird (Opcional)"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="earlyBirdDeadline"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Fecha Límite Early Bird"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Box component={"div" as any}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Resumen del Evento
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Título
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {watch('title')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Categoría
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {watch('category')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Descripción
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {watch('description')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Precio
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  Q{watch('price')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Capacidad
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {watch('capacity')} personas
                </Typography>
              </Grid>
            </Grid>

            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Marcar como destacado"
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
        {initialData ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent(activeStep)}
        </motion.div>
      </AnimatePresence>

      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancelar
        </Button>

        <Box component={"div" as any} sx={{ display: 'flex', gap: 2 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Atrás
          </Button>

          {activeStep === steps.length - 1 ? (
            <>
              <Button
                startIcon={<SaveIcon />}
                onClick={() => handleFormSubmit(true)}
                variant="outlined"
              >
                Guardar Borrador
              </Button>
              <Button
                startIcon={<PublishIcon />}
                onClick={() => handleFormSubmit(false)}
                variant="contained"
              >
                Publicar
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} variant="contained">
              Siguiente
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default EventFormWizard;
