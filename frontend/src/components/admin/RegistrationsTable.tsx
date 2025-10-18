import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Eye,
  X,
  Download,
  Search,
  Filter,
  DollarSign,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Registration {
  id: string | number;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  event: {
    id: string | number;
    title: string;
  };
  registrationDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  paymentMethod?: string;
  hasQR?: boolean;
  hasCertificate?: boolean;
}

interface RegistrationsTableProps {
  registrations: Registration[];
  loading?: boolean;
  onViewDetails: (registration: Registration) => void;
  onCancel: (registrationId: string | number) => void;
  onRefund: (registrationId: string | number) => void;
  onExport: () => void;
}

const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  loading = false,
  onViewDetails,
  onCancel,
  onRefund,
  onExport,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.event.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || reg.paymentStatus === paymentFilter;

    const matchesDateRange =
      (!dateRange.from || new Date(reg.registrationDate) >= new Date(dateRange.from)) &&
      (!dateRange.to || new Date(reg.registrationDate) <= new Date(dateRange.to));

    return matchesSearch && matchesStatus && matchesPayment && matchesDateRange;
  });

  // Pagination
  const paginatedRegistrations = filteredRegistrations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setDetailsDialogOpen(true);
    onViewDetails(registration);
  };

  const getStatusColor = (status: Registration['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'attended':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Registration['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      case 'attended':
        return 'Asistió';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: Registration['paymentStatus']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPaymentStatusLabel = (status: Registration['paymentStatus']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: theme.shadows[3] }}>
        {/* Toolbar */}
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Box component={"div" as any} sx={{ flex: '1 1 100%', display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre, email o evento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={onExport}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Exportar CSV
          </Button>
        </Toolbar>

        {/* Filters */}
        <Box component={"div" as any} sx={{ px: 2, pb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="confirmed">Confirmado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                  <MenuItem value="attended">Asistió</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado de Pago</InputLabel>
                <Select
                  value={paymentFilter}
                  label="Estado de Pago"
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="failed">Fallido</MenuItem>
                  <MenuItem value="refunded">Reembolsado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Desde"
                InputLabelProps={{ shrink: true }}
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Hasta"
                InputLabelProps={{ shrink: true }}
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Fecha Inscripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Estado Pago</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRegistrations.map((registration) => (
                <TableRow
                  key={registration.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box component={"div" as any}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {registration.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {registration.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{registration.event.title}</TableCell>
                  <TableCell>
                    {format(new Date(registration.registrationDate), 'dd MMM yyyy HH:mm', {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(registration.status)}
                      color={getStatusColor(registration.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentStatusLabel(registration.paymentStatus)}
                      color={getPaymentStatusColor(registration.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    Q{registration.amount.toLocaleString('es-GT', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <Box component={"div" as any} sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver Detalles">
                        <IconButton size="small" onClick={() => handleViewDetails(registration)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {registration.status !== 'cancelled' && (
                        <Tooltip title="Cancelar">
                          <IconButton
                            size="small"
                            onClick={() => onCancel(registration.id)}
                            color="error"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {registration.paymentStatus === 'completed' &&
                        registration.status !== 'cancelled' && (
                          <Tooltip title="Reembolsar">
                            <IconButton
                              size="small"
                              onClick={() => onRefund(registration.id)}
                            >
                              <RefundIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRegistrations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Detalles de Inscripción
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Información del Usuario
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{selectedRegistration.user.name}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{selectedRegistration.user.email}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Teléfono:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{selectedRegistration.user.phone}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                  Información del Evento
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Evento:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{selectedRegistration.event.title}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha Inscripción:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {format(new Date(selectedRegistration.registrationDate), 'dd MMM yyyy HH:mm', {
                        locale: es,
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Estado:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      label={getStatusLabel(selectedRegistration.status)}
                      color={getStatusColor(selectedRegistration.status)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                  Información de Pago
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Estado Pago:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      label={getPaymentStatusLabel(selectedRegistration.paymentStatus)}
                      color={getPaymentStatusColor(selectedRegistration.paymentStatus)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Monto:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Q{selectedRegistration.amount.toLocaleString('es-GT', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Grid>
                  {selectedRegistration.paymentMethod && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Método de Pago:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          {selectedRegistration.paymentMethod}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                  Recursos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box component={"div" as any} sx={{ display: 'flex', gap: 1 }}>
                  {selectedRegistration.hasQR && (
                    <Chip label="Código QR Generado" color="success" size="small" />
                  )}
                  {selectedRegistration.hasCertificate && (
                    <Chip label="Certificado Emitido" color="info" size="small" />
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RegistrationsTable;
