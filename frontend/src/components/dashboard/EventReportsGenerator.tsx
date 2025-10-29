import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, Mail, Printer, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventReportsGeneratorProps {
  filters: {
    dateRange: {
      startDate: string;
      endDate: string;
    };
    eventTypeId?: number;
    eventCategoryId?: number;
    eventStatus?: string;
    eventId?: number;
  };
  permissions: any;
  withErrorHandling: any;
}

interface ReportConfig {
  type: 'sales' | 'attendance' | 'events' | 'registrations' | 'revenue';
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeDetails: boolean;
  customTitle?: string;
  customDescription?: string;
}

interface ReportData {
  sales?: any;
  attendance?: any;
  events?: any;
  registrations?: any;
  revenue?: any;
}

const EventReportsGenerator: React.FC<EventReportsGeneratorProps> = ({
  filters,
  permissions,
  withErrorHandling
}) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'sales',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  useEffect(() => {
    if (reportConfig.type) {
      loadReportPreview();
    }
  }, [reportConfig.type, filters]);

  const loadReportPreview = async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        let data;

        switch (reportConfig.type) {
          case 'sales':
            data = await DashboardService.getSalesReport({
              startDate: filters.dateRange.startDate,
              endDate: filters.dateRange.endDate,
              eventId: filters.eventId?.toString(),
            });
            setReportData({ sales: data });
            setPreviewData(data.transactions || []);
            break;

          case 'attendance':
            data = await DashboardService.getAttendanceReport({
              startDate: filters.dateRange.startDate,
              endDate: filters.dateRange.endDate,
              eventId: filters.eventId?.toString(),
            });
            setReportData({ attendance: data });
            setPreviewData(data.attendance || []);
            break;

          case 'events':
            const eventsResult = await DashboardService.getEvents({
              startDateFrom: filters.dateRange.startDate,
              startDateTo: filters.dateRange.endDate,
              eventTypeId: filters.eventTypeId,
              eventCategoryId: filters.eventCategoryId,
              status: filters.eventStatus,
              limit: 100,
            });
            setReportData({ events: eventsResult.events });
            setPreviewData(eventsResult.events || []);
            break;

          case 'revenue':
            const revenueData = await DashboardService.getEventAnalytics({
              startDate: filters.dateRange.startDate,
              endDate: filters.dateRange.endDate,
              eventId: filters.eventId,
              eventTypeId: filters.eventTypeId,
              eventCategoryId: filters.eventCategoryId,
            });
            setReportData({ revenue: revenueData });
            setPreviewData(revenueData.revenueByCategory || []);
            break;

          default:
            setPreviewData([]);
        }
      }, 'Error cargando vista previa del reporte');

      await loadData();
    } catch (error) {
      console.error('Error in loadReportPreview:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const generateData = withErrorHandling(async () => {
        // Simular generación del reporte
        // En una implementación real, esto llamaría a un endpoint del backend
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay

        toast.success(`Reporte ${reportConfig.type} generado exitosamente en formato ${reportConfig.format.toUpperCase()}`);
      }, 'Error generando reporte');

      await generateData();
    } catch (error) {
      console.error('Error in generateReport:', error);
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setGenerating(true);
      const exportData = withErrorHandling(async () => {
        // Simular exportación
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Crear un enlace de descarga simulado
        const link = document.createElement('a');
        link.href = '#'; // En una implementación real, esto sería la URL del archivo
        link.download = `reporte-${reportConfig.type}-${new Date().toISOString().split('T')[0]}.${format}`;
        link.click();

        toast.success(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`);
      }, `Error exportando reporte en ${format.toUpperCase()}`);

      await exportData();
    } catch (error) {
      console.error('Error in exportReport:', error);
    } finally {
      setGenerating(false);
    }
  };

  const sendReportByEmail = async () => {
    try {
      setGenerating(true);
      const sendData = withErrorHandling(async () => {
        // Simular envío por email
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success('Reporte enviado exitosamente por correo electrónico');
      }, 'Error enviando reporte por email');

      await sendData();
    } catch (error) {
      console.error('Error in sendReportByEmail:', error);
    } finally {
      setGenerating(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT');
  };

  const renderPreviewTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Cargando vista previa...</span>
        </div>
      );
    }

    if (previewData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles para mostrar
        </div>
      );
    }

    switch (reportConfig.type) {
      case 'sales':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.slice(0, 10).map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell>{item.concept}</TableCell>
                  <TableCell>{item.method}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'attendance':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Inscritos</TableHead>
                <TableHead>Asistieron</TableHead>
                <TableHead>No Asistieron</TableHead>
                <TableHead>Tasa de Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.slice(0, 10).map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.eventTitle}</TableCell>
                  <TableCell>{formatDate(item.eventDate)}</TableCell>
                  <TableCell>{item.totalRegistrations}</TableCell>
                  <TableCell>{item.attendedCount}</TableCell>
                  <TableCell>{item.noShowCount}</TableCell>
                  <TableCell>
                    {item.totalRegistrations > 0
                      ? `${((item.attendedCount / item.totalRegistrations) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'events':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Inscritos</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.slice(0, 10).map((event: any, index: number) => (
                <TableRow key={event.id || index}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.eventType?.displayName}</TableCell>
                  <TableCell>{event.eventCategory?.displayName}</TableCell>
                  <TableCell>{formatDate(event.startDate)}</TableCell>
                  <TableCell>{event.price > 0 ? formatCurrency(event.price) : 'Gratuito'}</TableCell>
                  <TableCell>{event.registeredCount}</TableCell>
                  <TableCell>
                    <Badge variant={
                      event.eventStatus?.name === 'published' ? 'default' :
                      event.eventStatus?.name === 'completed' ? 'secondary' :
                      event.eventStatus?.name === 'cancelled' ? 'destructive' : 'outline'
                    }>
                      {event.eventStatus?.displayName}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'revenue':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Porcentaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.slice(0, 10).map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right">{item.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración del reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generador de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tipo de reporte */}
            <div>
              <Label htmlFor="report-type">Tipo de Reporte</Label>
              <Select
                value={reportConfig.type}
                onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventas e Ingresos</SelectItem>
                  <SelectItem value="attendance">Asistencia</SelectItem>
                  <SelectItem value="events">Eventos</SelectItem>
                  <SelectItem value="registrations">Inscripciones</SelectItem>
                  <SelectItem value="revenue">Ingresos por Categoría</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formato */}
            <div>
              <Label htmlFor="report-format">Formato</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opciones adicionales */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={reportConfig.includeCharts}
                  onCheckedChange={(checked) =>
                    setReportConfig(prev => ({ ...prev, includeCharts: checked as boolean }))
                  }
                />
                <Label htmlFor="include-charts">Incluir gráficos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-details"
                  checked={reportConfig.includeDetails}
                  onCheckedChange={(checked) =>
                    setReportConfig(prev => ({ ...prev, includeDetails: checked as boolean }))
                  }
                />
                <Label htmlFor="include-details">Incluir detalles</Label>
              </div>
            </div>
          </div>

          {/* Título y descripción personalizados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <Label htmlFor="custom-title">Título Personalizado (opcional)</Label>
              <Textarea
                id="custom-title"
                placeholder="Ingrese un título personalizado para el reporte"
                value={reportConfig.customTitle || ''}
                onChange={(e) => setReportConfig(prev => ({ ...prev, customTitle: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="custom-description">Descripción (opcional)</Label>
              <Textarea
                id="custom-description"
                placeholder="Ingrese una descripción para el reporte"
                value={reportConfig.customDescription || ''}
                onChange={(e) => setReportConfig(prev => ({ ...prev, customDescription: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista previa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderPreviewTable()}
          {previewData.length > 10 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Mostrando los primeros 10 registros. El reporte completo incluirá todos los datos.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones de exportación */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => exportReport('pdf')}
              disabled={generating}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {generating ? 'Generando...' : 'Exportar PDF'}
            </Button>
            <Button
              onClick={() => exportReport('excel')}
              disabled={generating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {generating ? 'Generando...' : 'Exportar Excel'}
            </Button>
            <Button
              onClick={() => exportReport('csv')}
              disabled={generating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {generating ? 'Generando...' : 'Exportar CSV'}
            </Button>
            <Button
              onClick={sendReportByEmail}
              disabled={generating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {generating ? 'Enviando...' : 'Enviar por Email'}
            </Button>
            <Button
              onClick={printReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Los reportes se generan basados en los filtros aplicados. Asegúrese de que los filtros estén configurados correctamente antes de exportar.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EventReportsGenerator;