import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  Toolbar,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Publish as PublishIcon,
  ContentCopy as DuplicateIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Event {
  id: string | number;
  title: string;
  date: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registrations: number;
  capacity: number;
  price: number;
  category: string;
  image?: string;
}

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string | number) => void;
  onView: (event: Event) => void;
  onPublish: (eventId: string | number) => void;
  onDuplicate: (eventId: string | number) => void;
  onCreate: () => void;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof Event;

const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onPublish,
  onDuplicate,
  onCreate,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<(string | number)[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('date');

  // Handle sorting
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort data
  const sortedEvents = React.useMemo(() => {
    const comparator = (a: Event, b: Event) => {
      if (orderBy === 'date') {
        return order === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (orderBy === 'registrations' || orderBy === 'capacity' || orderBy === 'price') {
        return order === 'asc'
          ? Number(a[orderBy]) - Number(b[orderBy])
          : Number(b[orderBy]) - Number(a[orderBy]);
      }
      const aValue = String(a[orderBy]).toLowerCase();
      const bValue = String(b[orderBy]).toLowerCase();
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    };

    return [...events].sort(comparator);
  }, [events, order, orderBy]);

  // Filter events by search query
  const filteredEvents = sortedEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const paginatedEvents = filteredEvents.slice(
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

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedEvents(paginatedEvents.map((e) => e.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleSelectOne = (eventId: string | number) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventData: Event) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventData);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedEvent) {
      onDelete(selectedEvent.id);
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Event['status']) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: theme.shadows[3] }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selectedEvents.length > 0 && {
            bgcolor: (theme) => `${theme.palette.primary.main}15`,
          }),
        }}
      >
        {selectedEvents.length > 0 ? (
          <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
            {selectedEvents.length} seleccionado(s)
          </Typography>
        ) : (
          <Box component={"div" as any} sx={{ flex: '1 1 100%', display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar eventos..."
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
            <Tooltip title="Filtros">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {selectedEvents.length > 0 ? (
          <Tooltip title="Eliminar seleccionados">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreate}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Nuevo Evento
          </Button>
        )}
      </Toolbar>

      {/* Table */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedEvents.length > 0 && selectedEvents.length < paginatedEvents.length
                  }
                  checked={
                    paginatedEvents.length > 0 && selectedEvents.length === paginatedEvents.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleRequestSort('title')}
                >
                  Título
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleRequestSort('date')}
                >
                  Fecha
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'registrations'}
                  direction={orderBy === 'registrations' ? order : 'asc'}
                  onClick={() => handleRequestSort('registrations')}
                >
                  Inscripciones
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'capacity'}
                  direction={orderBy === 'capacity' ? order : 'asc'}
                  onClick={() => handleRequestSort('capacity')}
                >
                  Capacidad
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                  onClick={() => handleRequestSort('price')}
                >
                  Precio
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEvents.map((event) => {
              const isSelected = selectedEvents.includes(event.id);
              const capacityPercent = (event.registrations / event.capacity) * 100;

              return (
                <TableRow
                  key={event.id}
                  hover
                  selected={isSelected}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectOne(event.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box component={"div" as any}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.category}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {format(new Date(event.date), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(event.status)}
                      color={getStatusColor(event.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box component={"div" as any}>
                      <Typography variant="body2">
                        {event.registrations} / {event.capacity}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            capacityPercent >= 90
                              ? theme.palette.error.main
                              : capacityPercent >= 70
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                        }}
                      >
                        {capacityPercent.toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{event.capacity}</TableCell>
                  <TableCell align="right">
                    {event.price === 0 ? (
                      <Chip label="Gratis" size="small" color="success" />
                    ) : (
                      `Q${event.price.toLocaleString('es-GT')}`
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box component={"div" as any} sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Ver">
                        <IconButton size="small" onClick={() => onView(event)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit(event)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, event)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredEvents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
      />

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedEvent) onPublish(selectedEvent.id);
            handleMenuClose();
          }}
        >
          <PublishIcon fontSize="small" sx={{ mr: 1 }} />
          {selectedEvent?.status === 'published' ? 'Despublicar' : 'Publicar'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedEvent) onDuplicate(selectedEvent.id);
            handleMenuClose();
          }}
        >
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedEvent) handleDeleteClick(selectedEvent);
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el evento "{selectedEvent?.title}"? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EventsTable;
