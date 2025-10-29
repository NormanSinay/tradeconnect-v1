import React, { useState } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, FileSpreadsheet, Image, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventReportsGeneratorProps {
  filters: {
    dateRange: { startDate: string; endDate: string };
    eventTypeId?: number;
    eventCategoryId?: number;
    eventStatus?: string;
    eventId?: number;
  };
  permissions: any;
  withErrorHandling: any;
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeDetails: boolean;
  includeFinancial: boolean;
  includeAttendance: boolean;
  reportType: 'summary' | 'detailed' | 'financial' | 'attendance';
}

const EventReportsGenerator: React.FC<EventReportsGeneratorProps> = ({
  filters,
  permissions,
  withErrorHandling
}) => {
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    includeFinancial: true,
    includeAttendance: true,
    reportType: 'summary'
  });

  const handleExportOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateReport = async () => {
    try {
      setExporting(true);

      const exportData = withErrorHandling(async () => {
        // Preparar parámetros de exportación
        const exportParams = {
          ...filters,
          ...exportOptions,
          filename: `reporte-eventos-${new Date().toISOString().split('T')[0]}`
        };

        // Aquí irían las llamadas reales a las APIs de exportación
        // Por ahora simulamos la exportación

        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular descarga
        const mockBlob = new Blob(['Mock report content'], {
          type: exportOptions.format === 'pdf' ? 'application/pdf' :
                exportOptions.format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                'text/csv'
        });

        const url = URL.createObjectURL(mockBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportParams.filename + '.' + exportOptions.format;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Reporte exportado exitosamente en formato ${exportOptions.format.toUpperCase()}`);
      }, 'Error generando reporte');

      await exportData();
    } catch (error) {
      console.error('Error in generateReport:', error);
    } finally {
      setExporting(false);
    }
  };

  const getReportTypeDescription = (type: string) => {
    switch (type) {
      case 'summary':
        return 'Resumen general con métricas principales y estadísticas básicas';
      case 'detailed':
        return 'Reporte detallado con información completa de cada evento';
      case 'financial':
        return 'Enfoque en datos financieros, ingresos y transacciones';
      case 'attendance':
        return 'Información detallada sobre asistencia e inscripciones';
      default:
        return '';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'csv': return <FileText className="h-5 w-5 text-blue-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Verificación de permisos */}
      {!permissions.canViewReports && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para generar reportes.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuración del reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generador de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de reporte */}
          <div>
            <Label className="text-base font-medium">Tipo de Reporte</Label>
            <Select
              value={exportOptions.reportType}
              onValueChange={(value: any) => handleExportOptionChange('reportType', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumen Ejecutivo</SelectItem>
                <SelectItem value="detailed">Reporte Detallado</SelectItem>
                <SelectItem value="financial">Análisis Financiero</SelectItem>
                <SelectItem value="attendance">Reporte de Asistencia</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {getReportTypeDescription(exportOptions.reportType)}
            </p>
          </div>

          {/* Formato de exportación */}
          <div>
            <Label className="text-base font-medium">Formato de Exportación</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {[
                { value: 'pdf', label: 'PDF', description: 'Documento profesional con gráficos' },
                { value: 'excel', label: 'Excel', description: 'Hoja de cálculo editable' },
                { value: 'csv', label: 'CSV', description: 'Datos crudos para análisis' }
              ].map((format) => (
                <div
                  key={format.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    exportOptions.format === format.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => handleExportOptionChange('format', format.value)}
                >
                  <div className="flex items-center gap-3">
                    {getFormatIcon(format.value)}
                    <div>
                      <h3 className="font-medium">{format.label}</h3>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opciones de contenido */}
          <div>
            <Label className="text-base font-medium">Contenido del Reporte</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) => handleExportOptionChange('includeCharts', checked)}
                  />
                  <Label htmlFor="include-charts" className="text-sm">
                    Incluir gráficos y visualizaciones
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-details"
                    checked={exportOptions.includeDetails}
                    onCheckedChange={(checked) => handleExportOptionChange('includeDetails', checked)}
                  />
                  <Label htmlFor="include-details" className="text-sm">
                    Detalles de eventos individuales
                  </Label>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-financial"
                    checked={exportOptions.includeFinancial}
                    onCheckedChange={(checked) => handleExportOptionChange('includeFinancial', checked)}
                  />
                  <Label htmlFor="include-financial" className="text-sm">
                    Información financiera
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-attendance"
                    checked={exportOptions.includeAttendance}
                    onCheckedChange={(checked) => handleExportOptionChange('includeAttendance', checked)}
                  />
                  <Label htmlFor="include-attendance" className="text-sm">
                    Datos de asistencia
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Información del período */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Período del Reporte</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Fecha inicio:</span>
                <span className="ml-2 font-medium">
                  {new Date(filters.dateRange.startDate).toLocaleDateString('es-GT')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Fecha fin:</span>
                <span className="ml-2 font-medium">
                  {new Date(filters.dateRange.endDate).toLocaleDateString('es-GT')}
                </span>
              </div>
            </div>
            {filters.eventId && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Evento específico:</span>
                <span className="ml-2 font-medium">ID {filters.eventId}</span>
              </div>
            )}
          </div>

          {/* Estado de exportación */}
          {exporting && (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <AlertDescription>
                Generando reporte... Esto puede tomar unos momentos.
              </AlertDescription>
            </Alert>
          )}

          {/* Botón de generación */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={generateReport}
              disabled={exporting || !permissions.canViewReports}
              size="lg"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando Reporte...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte {exportOptions.format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones de uso */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo usar el generador de reportes?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">1. Selecciona el tipo de reporte</h4>
                <p className="text-sm text-gray-600">
                  Elige entre resumen ejecutivo, reporte detallado, análisis financiero o reporte de asistencia.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">2. Elige el formato de salida</h4>
                <p className="text-sm text-gray-600">
                  PDF para documentos profesionales, Excel para análisis o CSV para procesamiento de datos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">3. Personaliza el contenido</h4>
                <p className="text-sm text-gray-600">
                  Selecciona qué elementos incluir: gráficos, detalles, información financiera, datos de asistencia.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">4. Genera y descarga</h4>
                <p className="text-sm text-gray-600">
                  El sistema procesará los datos y generará el archivo para descarga automática.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventReportsGenerator;