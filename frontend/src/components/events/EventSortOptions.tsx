import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Sort as SortIcon,
  ViewList,
  ViewModule,
} from '@mui/icons-material';
import type { EventSortOptionsProps } from '@/types/event.types';

const EventSortOptions: React.FC<EventSortOptionsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const handleSortByChange = (event: any) => {
    onSortChange(event.target.value, sortOrder);
  };

  const handleSortOrderChange = (_event: React.MouseEvent<HTMLElement>, newOrder: string | null) => {
    if (newOrder) {
      onSortChange(sortBy, newOrder as 'asc' | 'desc');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        mb: 3,
      }}
    >
      {/* Sort By */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Ordenar por</InputLabel>
        <Select
          value={sortBy}
          label="Ordenar por"
          onChange={handleSortByChange}
          startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
        >
          <MenuItem value="relevance">Relevancia</MenuItem>
          <MenuItem value="date">Fecha</MenuItem>
          <MenuItem value="price">Precio</MenuItem>
          <MenuItem value="popularity">Popularidad</MenuItem>
        </Select>
      </FormControl>

      {/* Sort Order */}
      <ToggleButtonGroup
        value={sortOrder}
        exclusive
        onChange={handleSortOrderChange}
        size="small"
      >
        <ToggleButton value="asc" aria-label="ascendente">
          ↑ Asc
        </ToggleButton>
        <ToggleButton value="desc" aria-label="descendente">
          ↓ Desc
        </ToggleButton>
      </ToggleButtonGroup>

      {/* View Toggle (for future use) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          Vista:
        </Typography>
        <ToggleButtonGroup
          value="grid"
          exclusive
          size="small"
          disabled // For now, only grid view
        >
          <ToggleButton value="list" aria-label="vista lista">
            <ViewList />
          </ToggleButton>
          <ToggleButton value="grid" aria-label="vista grid">
            <ViewModule />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default EventSortOptions;