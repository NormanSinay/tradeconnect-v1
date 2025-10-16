import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Clear,
  FilterList,
  LocationOn,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
// Date pickers temporarily disabled - will be implemented later
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { EventFilters as EventFiltersType, EventCategory, EventType } from '@/types/event.types';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
  categories: EventCategory[];
  types: EventType[];
  loading?: boolean;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  types,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin || 0,
    filters.priceMax || 1000,
  ]);
  const [dateFrom, setDateFrom] = useState<Date | null>(
    filters.dateFrom ? new Date(filters.dateFrom) : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    filters.dateTo ? new Date(filters.dateTo) : null
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ ...filters, search: searchTerm || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFiltersChange]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.category ? filters.category.split(',') : [];
    let newCategories: string[];

    if (checked) {
      newCategories = [...currentCategories, categoryId];
    } else {
      newCategories = currentCategories.filter(id => id !== categoryId);
    }

    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories.join(',') : ('' as any),
    });
  };

  const handleTypeChange = (typeSlug: string, checked: boolean) => {
    const currentTypes = filters.type ? filters.type.split(',') : [];
    let newTypes: string[];

    if (checked) {
      newTypes = [...currentTypes, typeSlug];
    } else {
      newTypes = currentTypes.filter(slug => slug !== typeSlug);
    }

    onFiltersChange({
      ...filters,
      type: newTypes.length > 0 ? newTypes.join(',') : undefined,
    });
  };

  const handleModalityChange = (modality: 'presencial' | 'virtual' | 'hibrido') => {
    onFiltersChange({
      ...filters,
      modality: filters.modality === modality ? undefined : modality,
    });
  };

  const handlePriceRangeChange = (_event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as [number, number];
    setPriceRange([min, max]);
  };

  const handlePriceRangeCommit = (_event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const [min, max] = newValue as [number, number];
    onFiltersChange({
      ...filters,
      priceMin: min > 0 ? min : undefined,
      priceMax: max < 1000 ? max : undefined,
    });
  };

  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date);
    onFiltersChange({
      ...filters,
      dateFrom: date ? date.toISOString().split('T')[0] : undefined,
    });
  };

  const handleDateToChange = (date: Date | null) => {
    setDateTo(date);
    onFiltersChange({
      ...filters,
      dateTo: date ? date.toISOString().split('T')[0] : undefined,
    });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      location: event.target.value || undefined,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 1000]);
    setDateFrom(null);
    setDateTo(null);
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.modality) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.location) count++;
    if (filters.featured) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      {/* Search Bar */}
      <Box component={"div" as any} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          disabled={loading}
        />
      </Box>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Box component={"div" as any} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Filtros activos ({activeFiltersCount}):
          </Typography>
          <Box component={"div" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.search && (
              <Chip
                label={`Búsqueda: ${filters.search}`}
                onDelete={() => onFiltersChange({ ...filters, search: undefined })}
                size="small"
              />
            )}
            {filters.category && (
              <Chip
                label={`Categoría: ${filters.category}`}
                onDelete={() => onFiltersChange({ ...filters, category: undefined })}
                size="small"
              />
            )}
            {filters.modality && (
              <Chip
                label={`Modalidad: ${filters.modality}`}
                onDelete={() => onFiltersChange({ ...filters, modality: undefined })}
                size="small"
              />
            )}
            {(filters.priceMin || filters.priceMax) && (
              <Chip
                label={`Precio: Q${filters.priceMin || 0} - Q${filters.priceMax || 1000}`}
                onDelete={() => onFiltersChange({ ...filters, priceMin: undefined, priceMax: undefined })}
                size="small"
              />
            )}
            {filters.location && (
              <Chip
                label={`Ubicación: ${filters.location}`}
                onDelete={() => onFiltersChange({ ...filters, location: undefined })}
                size="small"
              />
            )}
            <Button
              size="small"
              onClick={clearAllFilters}
              sx={{ ml: 'auto' }}
              disabled={loading}
            >
              Limpiar todos
            </Button>
          </Box>
        </Box>
      )}

      {/* Filters Accordion */}
      <Box component={"div" as any}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography>Filtros avanzados</Typography>
              {activeFiltersCount > 0 && (
                <Chip label={activeFiltersCount} size="small" color="primary" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Categories */}
              <Box component={"div" as any}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Categorías
                </Typography>
                <Box component={"div" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category.id}
                      control={
                        <Checkbox
                          checked={filters.category?.split(',').includes(category.id) || false}
                          onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={category.name}
                    />
                  ))}
                </Box>
              </Box>

              {/* Types */}
              <Box component={"div" as any}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tipos de Evento
                </Typography>
                <Box component={"div" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {types.map((type) => (
                    <FormControlLabel
                      key={type.id}
                      control={
                        <Checkbox
                          checked={filters.type?.split(',').includes(type.slug) || false}
                          onChange={(e) => handleTypeChange(type.slug, e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={type.name}
                    />
                  ))}
                </Box>
              </Box>

              {/* Modality */}
              <Box component={"div" as any}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Modalidad
                </Typography>
                <Box component={"div" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    { value: 'presencial', label: 'Presencial' },
                    { value: 'virtual', label: 'Virtual' },
                    { value: 'hibrido', label: 'Híbrido' },
                  ].map((modality) => (
                    <FormControlLabel
                      key={modality.value}
                      control={
                        <Checkbox
                          checked={filters.modality === modality.value}
                          onChange={() => handleModalityChange(modality.value as any)}
                          disabled={loading}
                        />
                      }
                      label={modality.label}
                    />
                  ))}
                </Box>
              </Box>

              {/* Price Range */}
              <Box component={"div" as any}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Rango de Precio (Q)
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  onChangeCommitted={handlePriceRangeCommit}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={50}
                  disabled={loading}
                  sx={{ mx: 1 }}
                />
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Q{priceRange[0]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Q{priceRange[1]}
                  </Typography>
                </Box>
              </Box>

              {/* Dates - Temporarily disabled */}
              <Box component={"div" as any} sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Fecha desde"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateFromChange(e.target.value ? new Date(e.target.value) : null)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Fecha hasta"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateToChange(e.target.value ? new Date(e.target.value) : null)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>

              {/* Location */}
              <TextField
                fullWidth
                label="Ubicación"
                value={filters.location || ''}
                onChange={handleLocationChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Featured Events */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.featured || false}
                    onChange={(e) => onFiltersChange({ ...filters, featured: e.target.checked || undefined })}
                    disabled={loading}
                  />
                }
                label="Solo eventos destacados"
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      {loading && (
        <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Paper>
  );
};

export default EventFilters;