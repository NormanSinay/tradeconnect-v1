# Admin Components - Quick Start Guide

## 1. Install Dependencies

```bash
cd frontend
npm install recharts
```

## 2. Import Components

```tsx
import {
  AdminSidebar,
  DashboardKPIs,
  DashboardCharts,
  EventsTable,
  EventFormWizard,
  RegistrationsTable,
  ReportsGenerator,
} from '@/components/admin';
```

## 3. Basic Usage Examples

### Admin Dashboard Page

```tsx
import React from 'react';
import { Box, Container } from '@mui/material';
import { DashboardKPIs, DashboardCharts } from '@/components/admin';

const AdminDashboard = () => {
  const kpis = [
    { label: 'Total Eventos', value: 150, icon: <EventIcon />, trend: 12.5 },
    { label: 'Ingresos', value: 45000, icon: <MoneyIcon />, trend: 8.2, format: 'currency' },
  ];

  return (
    <Container>
      <DashboardKPIs kpis={kpis} />
      <DashboardCharts data={chartData} />
    </Container>
  );
};
```

### Events Management Page

```tsx
import React from 'react';
import { EventsTable } from '@/components/admin';

const EventsManagement = () => {
  const handleEdit = (event) => {
    // Navigate to edit form
  };

  return (
    <EventsTable
      events={events}
      onEdit={handleEdit}
      onDelete={(id) => deleteEvent(id)}
      onView={(event) => viewEvent(event)}
      onPublish={(id) => publishEvent(id)}
      onDuplicate={(id) => duplicateEvent(id)}
      onCreate={() => navigate('/admin/events/new')}
    />
  );
};
```

### Create/Edit Event

```tsx
import React from 'react';
import { EventFormWizard } from '@/components/admin';

const CreateEvent = () => {
  const handleSubmit = (data, isDraft) => {
    if (isDraft) {
      saveDraft(data);
    } else {
      publishEvent(data);
    }
  };

  return (
    <EventFormWizard
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin/events')}
    />
  );
};
```

### Registrations Management

```tsx
import React from 'react';
import { RegistrationsTable } from '@/components/admin';

const RegistrationsManagement = () => {
  return (
    <RegistrationsTable
      registrations={registrations}
      onViewDetails={(reg) => console.log(reg)}
      onCancel={(id) => cancelRegistration(id)}
      onRefund={(id) => refundRegistration(id)}
      onExport={() => exportToCSV()}
    />
  );
};
```

### Reports

```tsx
import React from 'react';
import { ReportsGenerator } from '@/components/admin';

const Reports = () => {
  const handleGenerate = async (config) => {
    const report = await generateReport(config);
    downloadReport(report);
  };

  return (
    <ReportsGenerator
      onGenerate={handleGenerate}
      recentReports={recentReports}
    />
  );
};
```

## 4. Admin Layout with Sidebar

```tsx
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(!sidebarOpen)}
        userRole="admin"
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
```

## 5. Route Configuration

```tsx
// In your router configuration
import { AdminLayout } from '@/components/admin/AdminLayout';

const routes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'events', element: <EventsManagement /> },
      { path: 'events/new', element: <CreateEvent /> },
      { path: 'events/:id/edit', element: <EditEvent /> },
      { path: 'registrations', element: <RegistrationsManagement /> },
      { path: 'reports', element: <Reports /> },
    ],
  },
];
```

## 6. TypeScript Types

```tsx
// Import types when needed
import type { KPIData, ChartData, Event, Registration } from '@/components/admin';

const kpis: KPIData[] = [...];
const events: Event[] = [...];
const registrations: Registration[] = [...];
```

## Common Patterns

### Loading States
```tsx
<DashboardKPIs kpis={kpis} loading={isLoading} />
```

### Error Handling
```tsx
const handleDelete = async (id) => {
  try {
    await deleteEvent(id);
    toast.success('Evento eliminado');
  } catch (error) {
    toast.error('Error al eliminar evento');
  }
};
```

### Data Fetching
```tsx
const { data: events, isLoading } = useQuery({
  queryKey: ['admin-events'],
  queryFn: () => adminService.getEvents(),
});
```

## Tips

1. **Always provide proper types** - Use TypeScript interfaces
2. **Handle loading states** - Show skeletons while loading
3. **Add error boundaries** - Wrap admin components in ErrorBoundary
4. **Use react-query** - For data fetching and caching
5. **Add toast notifications** - For user feedback
6. **Implement role checks** - Protect admin routes

## File Locations

```
frontend/src/components/admin/
├── AdminSidebar.tsx
├── DashboardKPIs.tsx
├── DashboardCharts.tsx
├── EventsTable.tsx
├── EventFormWizard.tsx
├── RegistrationsTable.tsx
├── ReportsGenerator.tsx
└── index.ts
```

## Need Help?

- Check `ADMIN_COMPONENTS_SUMMARY.md` for detailed documentation
- Review component prop types in the source files
- See existing HomePage.tsx for styling patterns
