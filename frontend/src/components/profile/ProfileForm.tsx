import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Save,
  Cancel,
  CameraAlt,
  Person,
  Email,
  Phone,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { VALIDATION_RULES } from '@/utils/constants';
import { authService } from '@/services/api';
import { toast } from 'react-hot-toast';
import type { User } from '@/types';

// Validation schema
const profileSchema = yup.object({
  firstName: yup
    .string()
    .required('Nombre es requerido')
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre debe tener máximo 50 caracteres'),
  lastName: yup
    .string()
    .required('Apellido es requerido')
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido debe tener máximo 50 caracteres'),
  email: yup
    .string()
    .email('Email inválido')
    .required('Email es requerido'),
  phone: yup
    .string()
    .matches(
      VALIDATION_RULES.PHONE.GUATEMALA_REGEX,
      'Formato: +502 XXXX-XXXX'
    )
    .nullable(),
});

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ProfileFormProps {
  user: User;
  onProfileUpdate: (user: User) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    },
    mode: 'onBlur',
  });

  // Reset form when user changes
  useEffect(() => {
    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setAvatarPreview(user.avatar || null);
  }, [user, reset]);

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setAvatarPreview(user.avatar || null);
    setAvatarFile(null);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      if (data.phone) {
        formData.append('phone', data.phone);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Call API to update profile
      const response = await authService.updateProfile(formData);

      if (response.success && response.data) {
        onProfileUpdate(response.data);
        setIsEditing(false);
        setAvatarFile(null);
        toast.success('Perfil actualizado exitosamente');
      } else {
        throw new Error(response.message || 'Error al actualizar perfil');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(
        error.response?.data?.message || 'Error al actualizar el perfil'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <Box
        component={"div" as any}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Información Personal
        </Typography>
        {!isEditing && (
          <Button
            variant="contained"
            startIcon={<Person />}
            onClick={() => setIsEditing(true)}
          >
            Editar Perfil
          </Button>
        )}
      </Box>

      {/* Avatar Section */}
      <Box
        component={"div" as any}
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          pb: 3,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box component={"div" as any} sx={{ position: 'relative' }}>
          <Avatar
            src={avatarPreview || undefined}
            sx={{
              width: 120,
              height: 120,
              fontSize: '3rem',
              bgcolor: 'primary.main',
            }}
          >
            {!avatarPreview && user.firstName?.[0]}
            {!avatarPreview && user.lastName?.[0]}
          </Avatar>
          {isEditing && (
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <CameraAlt />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </IconButton>
          )}
        </Box>
        <Box component={"div" as any} sx={{ ml: 3 }}>
          <Typography variant="h6" gutterBottom>
            Foto de Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Formato: JPG, PNG o GIF. Tamaño máximo: 5MB
          </Typography>
          {avatarFile && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Nueva imagen seleccionada. Guarda los cambios para aplicar.
            </Alert>
          )}
        </Box>
      </Box>

      {/* Form Fields */}
      <Grid container spacing={3}>
        {/* First Name */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Nombre"
                placeholder="Juan"
                disabled={!isEditing}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                InputProps={{
                  startAdornment: (
                    <Person sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
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
                label="Apellido"
                placeholder="Pérez"
                disabled={!isEditing}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                InputProps={{
                  startAdornment: (
                    <Person sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="email"
                label="Email"
                placeholder="juan.perez@example.com"
                disabled={!isEditing}
                error={!!errors.email}
                helperText={
                  errors.email?.message || 'Email para notificaciones y acceso'
                }
                InputProps={{
                  startAdornment: (
                    <Email sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Phone */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Teléfono"
                placeholder="+502 1234-5678"
                disabled={!isEditing}
                error={!!errors.phone}
                helperText={errors.phone?.message || 'Formato: +502 XXXX-XXXX'}
                InputProps={{
                  startAdornment: (
                    <Phone sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      {isEditing && (
        <Box component={"div" as any} sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            disabled={isSaving || !isDirty}
            size="large"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
            disabled={isSaving}
            size="large"
          >
            Cancelar
          </Button>
        </Box>
      )}

      {/* Info Alert */}
      {!isEditing && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Mantén tu información actualizada para recibir confirmaciones y
          recordatorios de eventos.
        </Alert>
      )}
    </Box>
  );
};

export default ProfileForm;
