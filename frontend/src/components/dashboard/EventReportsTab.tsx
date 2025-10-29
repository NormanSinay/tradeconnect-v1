import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, Filter, AlertTriangle } from 'lucide-react';
import EventAnalyticsDashboard from './EventAnalyticsDashboard';
import EventReportsGenerator from './EventReportsGenerator';
import toast from 'react-hot-toast';

interface EventReportsTabProps {
  activeTab: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ReportFilters {
  dateRange: DateRange;
  eventTypeId?: number;
  eventCategoryId?: number;
  eventStatus?: string;
  eventId?: number;
}

const EventReportsTab: React.FC<EventReportsTabProps> = ({ activeTab }) => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  const [loading, setLoading] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState('analytics');

  // Filtros globales
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Primer día del mes actual
      endDate: new Date().toISOString().split('T')[0], // Hoy
    },
    eventTypeId: undefined,
    eventCategoryId: undefined,
    eventStatus: 'all',
    eventId: undefined,
  });

  // Estados para opciones de filtros
  const [eventTypes, setEventTypes] = useState<Array<{ id: number; name: string; displayName: string }>>([]);
  const [eventCategories, setEventCategories] = useState<Array<{ id: number; name: string; displayName: string }>>([]);
  const [events, setEvents] = useState<Array<{ id: number; title: string; startDate: string }>>([]);

  useEffect(() => {
    if (activeTab === 'reportes') {
      loadFilterOptions();
    }
  }, [activeTab]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        // Cargar tipos de eventos
        const typesResponse = await fetch('/api/v1/event-types', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${useAuthStore.getState().token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const typesData = await typesResponse.json();
        if (typesResponse.ok && typesData.success) {
          setEventTypes(typesData.data || []);
        }

        // Cargar categorías de eventos
        const categoriesResponse = await fetch('/api/v1/event-categories', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${useAuthStore.getState().token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const categoriesData = await categoriesResponse.json();
        if (categoriesResponse.ok && categoriesData.success) {
          setEventCategories(categoriesData.data || []);
        }

        // Cargar eventos recientes para filtro
        const eventsResult = await DashboardService.getEvents({
          limit: 100,
          sortBy: 'startDate',
          sortOrder: 'DESC'
        });
        setEvents(eventsResult.events || []);
      }, 'Error cargando opciones de filtros');

      await loadData();
    } catch (error) {
      console.error('Error in loadFilterOptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      eventTypeId: undefined,
      eventCategoryId: undefined,
      eventStatus: 'all',
      eventId: undefined,
    });
  };

  const getQuickDateRanges = () => [
    {
      label: 'Esta semana',
      value: 'week',
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    {
      label: 'Este mes',
      value: 'month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    {
      label: 'Últimos 3 meses',
      value: 'quarter',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    {
      label: 'Este año',
      value: 'year',
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  ];

  const applyQuickDateRange = (range: { startDate: string; endDate: string }) => {
    handleDateRangeChange(range.startDate, range.endDate);
  };

  if (activeTab !== 'reportes') return null;

  return (
    <div className="space-y-6">
      {/* Verificación de permisos */}
      {false && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para ver reportes y analytics.
          </AlertDescription>
        </Alert>
      )}

      {/* Header con filtros globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reportes y Analytics de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Rango de fechas rápido */}
            <div>
              <Label className="text-sm font-medium">Período rápido</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {getQuickDateRanges().map((range) => (
                  <Button
                    key={range.value}
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickDateRange(range)}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros detallados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="start-date">Fecha inicio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.dateRange.startDate}
                  onChange={(e) => handleDateRangeChange(e.target.value, filters.dateRange.endDate)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Fecha fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.dateRange.endDate}
                  onChange={(e) => handleDateRangeChange(filters.dateRange.startDate, e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="event-type">Tipo de evento</Label>
                <Select
                  value={filters.eventTypeId?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('eventTypeId', value === 'all' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="event-category">Categoría</Label>
                <Select
                  value={filters.eventCategoryId?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('eventCategoryId', value === 'all' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {eventCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-status">Estado del evento</Label>
                <Select
                  value={filters.eventStatus || 'all'}
                  onValueChange={(value) => handleFilterChange('eventStatus', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="ongoing">En Progreso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="specific-event">Evento específico</Label>
                <Select
                  value={filters.eventId?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('eventId', value === 'all' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los eventos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    {events.slice(0, 50).map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.title} ({new Date(event.startDate).toLocaleDateString('es-GT')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido de reportes */}
      <Tabs value={activeReportTab} onValueChange={setActiveReportTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Generador de Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <EventAnalyticsDashboard
            filters={filters}
            permissions={permissions}
            withErrorHandling={withErrorHandling}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <EventReportsGenerator
            filters={filters}
            permissions={permissions}
            withErrorHandling={withErrorHandling}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventReportsTab;