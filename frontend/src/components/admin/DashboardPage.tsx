import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  Event,
  People,
  Payment,
  TrendingUp,
  Edit,
  Delete,
  Add,
  Search,
  FilterList,
  MoreVert,
  CheckCircle,
  Cancel,
  Schedule,
  LocationOn,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Mock data for dashboard
  const mockStats = {
    totalEvents: 24,
    activeEvents: 8,
    totalUsers: 1250,
    totalRevenue: 45000,
    monthlyRevenue: 8500,
    newRegistrations: 45,
  };

  const mockEvents = [
    {
      id: 1,
      title: 'Conferencia de Tecnología 2024',
      status: 'active',
      registrations: 150,
      capacity: 200,
      startDate: '2024-02-20T09:00:00Z',
      price: 150,
      category: 'Tecnología',
    },
    {
      id: 2,
      title: 'Workshop de Marketing Digital',
      status: 'draft',
      registrations: 0,
      capacity: 50,
      startDate: '2024-03-15T10:00:00Z',
      price: 200,
      category: 'Marketing',
    },
    {
      id: 3,
      title: 'Seminario de Liderazgo',
      status: 'completed',
      registrations: 75,
      capacity: 80,
      startDate: '2024-01-15T14:00:00Z',
      price: 120,
      category: 'Liderazgo',
    },
  ];

  const mockUsers = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@email.com',
      role: 'user',
      status: 'active',
      registeredAt: '2024-01-10T00:00:00Z',
      eventsCount: 3,
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@email.com',
      role: 'organizer',
      status: 'active',
      registeredAt: '2024-01-05T00:00:00Z',
      eventsCount: 5,
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: number) => {
    // Mock delete
    console.log('Delete event:', eventId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'draft':
        return 'Borrador';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => `Q${amount.toLocaleString()}`;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Dashboard Administrativo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona eventos, usuarios y visualiza estadísticas del sistema
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {mockStats.totalEvents}
                  </Typography>
                  <Typography variant="body2">Total Eventos</Typography>
                </Box>
                <Event sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {mockStats.activeEvents}
                  </Typography>
                  <Typography variant="body2">Eventos Activos</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {mockStats.totalUsers}
                  </Typography>
                  <Typography variant="body2">Total Usuarios</Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(mockStats.totalRevenue)}
                  </Typography>
                  <Typography variant="body2">Ingresos Totales</Typography>
                </Box>
                <Payment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<Event />} label="Gestión de Eventos" />
          <Tab icon={<People />} label="Gestión de Usuarios" />
          <Tab icon={<Payment />} label="Reportes" />
        </Tabs>

        {/* Dashboard Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Eventos Próximos
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Evento</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Inscripciones</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockEvents.slice(0, 5).map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {event.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.category}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(event.startDate)}</TableCell>
                          <TableCell>
                            {event.registrations}/{event.capacity}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(event.status)}
                              color={getStatusColor(event.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleEditEvent(event)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteEvent(event.id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Acciones Rápidas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateEvent}
                    fullWidth
                  >
                    Crear Evento
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    fullWidth
                  >
                    Gestionar Usuarios
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    fullWidth
                  >
                    Ver Reportes
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Events Management Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Gestión de Eventos
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateEvent}
            >
              Nuevo Evento
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Evento</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Inscripciones</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {event.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{event.category}</TableCell>
                    <TableCell>{formatDate(event.startDate)}</TableCell>
                    <TableCell>{formatCurrency(event.price)}</TableCell>
                    <TableCell>
                      {event.registrations}/{event.capacity}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(event.status)}
                        color={getStatusColor(event.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditEvent(event)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteEvent(event.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Users Management Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Gestión de Usuarios
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Eventos</TableCell>
                  <TableCell>Registro</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === 'admin' ? 'Admin' : user.role === 'organizer' ? 'Organizador' : 'Usuario'}
                        color={user.role === 'admin' ? 'error' : user.role === 'organizer' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 'active' ? 'Activo' : 'Inactivo'}
                        color={user.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.eventsCount}</TableCell>
                    <TableCell>{formatDate(user.registeredAt)}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Reportes y Estadísticas
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ingresos Mensuales
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(mockStats.monthlyRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +12% vs mes anterior
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Nuevas Inscripciones
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {mockStats.newRegistrations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Este mes
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Acciones de Reportes
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="outlined" startIcon={<Payment />}>
                    Reporte de Ventas
                  </Button>
                  <Button variant="outlined" startIcon={<Event />}>
                    Reporte de Eventos
                  </Button>
                  <Button variant="outlined" startIcon={<People />}>
                    Reporte de Usuarios
                  </Button>
                  <Button variant="outlined" startIcon={<TrendingUp />}>
                    Exportar Datos
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Event Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Título del Evento"
              defaultValue={selectedEvent?.title || ''}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              defaultValue={selectedEvent?.description || ''}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de Inicio"
                  type="datetime-local"
                  defaultValue={selectedEvent?.startDate || ''}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de Fin"
                  type="datetime-local"
                  defaultValue={selectedEvent?.endDate || ''}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio"
                  type="number"
                  defaultValue={selectedEvent?.price || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacidad"
                  type="number"
                  defaultValue={selectedEvent?.capacity || ''}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select defaultValue={selectedEvent?.category || ''}>
                <MenuItem value="Tecnología">Tecnología</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Liderazgo">Liderazgo</MenuItem>
                <MenuItem value="Negocios">Negocios</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained">
            {selectedEvent ? 'Actualizar' : 'Crear'} Evento
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;