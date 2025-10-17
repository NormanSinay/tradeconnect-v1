import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Close as Cancel,
  Event,
  School,
  Receipt,
  Settings,
  Download,
  QrCode,
  CalendarToday,
  LocationOn,
  AccessTime,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { EventRegistration } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box component={"div" as any} sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Mock data for user events and certificates
  const mockRegistrations = [
    {
      id: 1,
      eventId: 1,
      userId: user?.id || 1,
      participantType: 'individual' as const,
      quantity: 1,
      totalAmount: 150,
      paymentStatus: 'paid' as const,
      registrationStatus: 'confirmed' as const,
      registeredAt: '2024-01-15T10:00:00Z',
      participantData: [],
      event: {
        id: 1,
        title: 'Conferencia de Tecnología 2024',
        startDate: '2024-02-20T09:00:00Z',
        location: 'Centro de Convenciones, Guatemala',
        eventCategory: { id: 1, name: 'Tecnología', color: '#1976d2', isActive: true },
      },
    },
    {
      id: 2,
      eventId: 2,
      userId: user?.id || 1,
      participantType: 'individual' as const,
      quantity: 1,
      totalAmount: 200,
      paymentStatus: 'paid' as const,
      registrationStatus: 'confirmed' as const,
      registeredAt: '2024-01-10T14:30:00Z',
      participantData: [],
      event: {
        id: 2,
        title: 'Workshop de Marketing Digital',
        startDate: '2024-03-15T10:00:00Z',
        virtualLocation: 'Zoom Meeting',
        eventCategory: { id: 2, name: 'Marketing', color: '#2e7d32', isActive: true },
      },
    },
  ];

  const mockCertificates = [
    {
      id: 1,
      certificateNumber: 'CERT-2024-001',
      eventTitle: 'Conferencia de Tecnología 2024',
      issuedAt: '2024-02-20T17:00:00Z',
      status: 'issued',
    },
    {
      id: 2,
      certificateNumber: 'CERT-2024-002',
      eventTitle: 'Workshop de Marketing Digital',
      issuedAt: '2024-03-15T16:00:00Z',
      status: 'issued',
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setEditForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update API call
      // await updateProfile(editForm);
      setIsEditing(false);
      toast.success('Perfil actualizado exitosamente (simulado)');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleDownloadCertificate = (certificateId: number) => {
    // Mock download
    toast.success(`Descargando certificado ${certificateId}...`);
  };

  const handleDownloadQR = (registrationId: number) => {
    // Mock download
    toast.success(`Descargando QR para registro ${registrationId}...`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Acceso requerido
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Debes iniciar sesión para acceder a tu perfil.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tu información personal y accede a tus eventos y certificados
        </Typography>
      </Box>

      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem' }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={user.roles?.includes('admin') ? 'Administrador' : user.roles?.includes('organizer') ? 'Organizador' : 'Usuario'}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={user.isActive ? 'Activo' : 'Inactivo'}
                color={user.isActive ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Miembro desde {formatDate(user.createdAt)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Person />} label="Mi Perfil" />
          <Tab icon={<Event />} label="Mis Eventos" />
          <Tab icon={<School />} label="Mis Certificados" />
          <Tab icon={<Receipt />} label="Historial de Pagos" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Información Personal
              </Typography>

              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="body1">
                  Actualiza tu información personal y preferencias
                </Typography>
                <Button
                  variant={isEditing ? 'outlined' : 'contained'}
                  startIcon={isEditing ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={isEditing ? editForm.firstName : user.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={isEditing ? editForm.lastName : user.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={isEditing ? editForm.email : user.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={isEditing ? editForm.phone : user.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box component={"div" as any} sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleEditToggle}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Estadísticas
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {mockRegistrations.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Eventos
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {mockCertificates.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Certificados
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>💡 Tip:</strong> Mantén tu información actualizada para recibir
                  confirmaciones y recordatorios de eventos.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Events Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Mis Eventos
          </Typography>

          <Tabs value={0} sx={{ mb: 3 }}>
            <Tab label="Próximos" />
            <Tab label="Pasados" />
          </Tabs>

          <Grid container spacing={3}>
            {mockRegistrations.map((registration) => (
              <Grid item xs={12} md={6} key={registration.id}>
                <Card>
                  <CardContent>
                    <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {registration.event?.title}
                      </Typography>
                      <Chip
                        label={getStatusText(registration.registrationStatus)}
                        color={getStatusColor(registration.registrationStatus) as any}
                        size="small"
                      />
                    </Box>

                    <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(registration.event?.startDate || '')}
                        </Typography>
                      </Box>

                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {registration.event?.location || registration.event?.virtualLocation || 'Ubicación por confirmar'}
                        </Typography>
                      </Box>

                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Q{registration.totalAmount} • {registration.participantType === 'individual' ? 'Individual' : 'Empresa'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box component={"div" as any} sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<QrCode />}
                        onClick={() => handleDownloadQR(registration.id)}
                      >
                        QR
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Event />}
                        variant="outlined"
                      >
                        Detalles
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Certificates Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Mis Certificados
          </Typography>

          <Grid container spacing={3}>
            {mockCertificates.map((certificate) => (
              <Grid item xs={12} md={6} key={certificate.id}>
                <Card>
                  <CardContent>
                    <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box component={"div" as any}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {certificate.eventTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Certificado #{certificate.certificateNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Emitido: {formatDate(certificate.issuedAt)}
                        </Typography>
                      </Box>
                      <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                    </Box>

                    <Box component={"div" as any} sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => handleDownloadCertificate(certificate.id)}
                      >
                        Descargar PDF
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<QrCode />}
                      >
                        Ver QR
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box component={"div" as any} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              size="large"
            >
              Descargar Todos (ZIP)
            </Button>
          </Box>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Historial de Pagos
          </Typography>

          <List>
            {mockRegistrations.map((registration) => (
              <ListItem key={registration.id} divider>
                <ListItemIcon>
                  <Receipt color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={registration.event?.title}
                  secondary={
                    <Box component={"div" as any}>
                      <Typography variant="body2" component="span">
                        Fecha: {formatDate(registration.registeredAt)} •
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                        Monto: Q{registration.totalAmount}
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                        Estado: {getStatusText(registration.paymentStatus)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <Download />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage;