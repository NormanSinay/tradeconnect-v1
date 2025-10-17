import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  CircularProgress,
} from '@mui/material';
import { adminService } from '@/services/api';
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
    {value === index && <Box component={"div" as any} sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Read tab from URL query parameter on mount and when it changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 3) {
        setActiveTab(tabIndex);
      }
    }
  }, [searchParams]);

  // Fetch dashboard stats from backend
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminService.getDashboard(),
    staleTime: 30000, // 30 segundos
  });

  // Fetch events from backend
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => adminService.getEvents({ limit: 10 }),
    staleTime: 30000,
  });

  // Fetch users from backend
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers({ limit: 10 }),
    staleTime: 30000,
  });

  const stats = dashboardData?.data || {
    totalEvents: 0,
    activeEvents: 0,
    totalUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    newRegistrations: 0,
  };

  const events = eventsData?.data?.events || [];
  const users = usersData?.data?.users || [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Update URL with tab parameter
    setSearchParams({ tab: newValue.toString() });
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
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Dashboard Administrativo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona eventos, usuarios y visualiza estadísticas del sistema
        </Typography>
      </Box>

      {/* Stats Cards */}
      {statsLoading ? (
        <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box component={"div" as any}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalEvents}
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
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box component={"div" as any}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.activeEvents}
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
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box component={"div" as any}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.totalUsers}
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
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box component={"div" as any}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2">Ingresos Totales</Typography>
                  </Box>
                  <Payment sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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
                      {eventsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <CircularProgress size={30} />
                          </TableCell>
                        </TableRow>
                      ) : events.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="text.secondary">No hay eventos registrados</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        events.slice(0, 5).map((event: any) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <Box component={"div" as any}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {event.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {event.eventCategory?.name || 'Sin categoría'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{formatDate(event.startDate)}</TableCell>
                            <TableCell>
                              {event.registrationsCount || 0}/{event.capacity}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={event.isPublished ? 'Publicado' : 'Borrador'}
                                color={event.isPublished ? 'success' : 'warning'}
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
                        ))
                      )}
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
                <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          <Box component={"div" as any} sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                {eventsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No hay eventos registrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Box component={"div" as any}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {event.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{event.eventCategory?.name || 'Sin categoría'}</TableCell>
                      <TableCell>{formatDate(event.startDate)}</TableCell>
                      <TableCell>{formatCurrency(event.price || 0)}</TableCell>
                      <TableCell>
                        {event.registrationsCount || 0}/{event.capacity}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.isPublished ? 'Publicado' : 'Borrador'}
                          color={event.isPublished ? 'success' : 'warning'}
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
                  ))
                )}
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
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No hay usuarios registrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {user.firstName?.charAt(0) || user.email?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {user.fullName || `${user.firstName} ${user.lastName}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.roles?.[0] || 'user'}
                          color={user.roles?.includes('admin') ? 'error' : user.roles?.includes('manager') ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Activo' : 'Inactivo'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.eventsCount || 0}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
                  {formatCurrency(stats.monthlyRevenue)}
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
                  {stats.newRegistrations}
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
                <Box component={"div" as any} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
          <Box component={"div" as any} sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
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