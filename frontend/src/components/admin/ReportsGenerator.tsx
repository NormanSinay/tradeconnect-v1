import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  BarChart3,
  Calendar,
  DollarSign,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ReportType = 'events' | 'financial' | 'certificates' | 'registrations' | 'attendance';
type ReportFormat = 'pdf' | 'excel' | 'csv';

interface RecentReport {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  generatedDate: string;
  size: string;
  downloadUrl?: string;
}

interface ReportsGeneratorProps {
  onGenerate?: (config: {
    type: ReportType;
    format: ReportFormat;
    dateFrom: string;
    dateTo: string;
    filters?: any;
  }) => Promise<void>;
  recentReports?: RecentReport[];
}

const ReportsGenerator: React.FC<ReportsGeneratorProps> = ({ onGenerate, recentReports = [] }) => {
  const theme = useTheme();
  const [reportType, setReportType] = useState<ReportType>('events');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      value: 'events' as const,
      label: 'Eventos',
      icon: <EventIcon />,
      description: 'Reporte de eventos creados, publicados y estadísticas',
      color: '#1976D2',
    },
    {
      value: 'financial' as const,
      label: 'Financiero',
      icon: <MoneyIcon />,
      description: 'Ingresos, pagos, reembolsos y reconciliación',
      color: '#388E3C',
    },
    {
      value: 'certificates' as const,
      label: 'Certificados',
      icon: <CertificateIcon />,
      description: 'Certificados emitidos y validaciones',
      color: '#F57C00',
    },
    {
      value: 'registrations' as const,
      label: 'Inscripciones',
      icon: <ReportIcon />,
      description: 'Inscripciones por evento, usuario y estado',
      color: '#7B1FA2',
    },
    {
      value: 'attendance' as const,
      label: 'Asistencia',
      icon: <ReportIcon />,
      description: 'Control de asistencia y accesos',
      color: '#D32F2F',
    },
  ];

  const formats = [
    {
      value: 'pdf' as const,
      label: 'PDF',
      icon: <PdfIcon />,
      description: 'Documento en formato PDF',
    },
    {
      value: 'excel' as const,
      label: 'Excel',
      icon: <ExcelIcon />,
      description: 'Hoja de cálculo XLSX',
    },
    {
      value: 'csv' as const,
      label: 'CSV',
      icon: <CsvIcon />,
      description: 'Valores separados por comas',
    },
  ];

  const defaultRecentReports: RecentReport[] = [
    {
      id: '1',
      name: 'Reporte de Eventos - Octubre 2025',
      type: 'events',
      format: 'pdf',
      generatedDate: '2025-10-14T10:30:00',
      size: '2.3 MB',
    },
    {
      id: '2',
      name: 'Reporte Financiero - Q3 2025',
      type: 'financial',
      format: 'excel',
      generatedDate: '2025-10-13T15:45:00',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'Certificados Emitidos - Septiembre',
      type: 'certificates',
      format: 'csv',
      generatedDate: '2025-10-12T09:15:00',
      size: '456 KB',
    },
  ];

  const displayReports = recentReports.length > 0 ? recentReports : defaultRecentReports;

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo) {
      alert('Por favor selecciona un rango de fechas');
      return;
    }

    setLoading(true);
    try {
      if (onGenerate) {
        await onGenerate({
          type: reportType,
          format: reportFormat,
          dateFrom,
          dateTo,
        });
      } else {
        // Simulate generation
        await new Promise((resolve) => setTimeout(resolve, 2000));
        alert(`Reporte generado: ${reportType} en formato ${reportFormat}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    return reportTypes.find((rt) => rt.value === type)?.label || type;
  };

  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf':
        return <PdfIcon fontSize="small" />;
      case 'excel':
        return <ExcelIcon fontSize="small" />;
      case 'csv':
        return <CsvIcon fontSize="small" />;
    }
  };

  return (
    <Box component={"div" as any}>
      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, boxShadow: theme.shadows[3] }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Generar Nuevo Reporte
            </Typography>

            {/* Report Type Selection */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Tipo de Reporte
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {reportTypes.map((type) => (
                <Grid item xs={12} sm={6} md={4} key={type.value}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      onClick={() => setReportType(type.value)}
                      sx={{
                        cursor: 'pointer',
                        border: `2px solid ${
                          reportType === type.value ? type.color : 'transparent'
                        }`,
                        backgroundColor:
                          reportType === type.value ? `${type.color}10` : 'background.paper',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          component={"div" as any}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            color: type.color,
                          }}
                        >
                          {type.icon}
                          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                            {type.label}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Date Range */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Rango de Fechas
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Desde"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Hasta"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Format Selection */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Formato de Exportación
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {formats.map((format) => (
                <Grid item xs={12} sm={4} key={format.value}>
                  <Card
                    onClick={() => setReportFormat(format.value)}
                    sx={{
                      cursor: 'pointer',
                      border: `2px solid ${
                        reportFormat === format.value ? theme.palette.primary.main : 'transparent'
                      }`,
                      backgroundColor:
                        reportFormat === format.value
                          ? `${theme.palette.primary.main}10`
                          : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box component={"div" as any} sx={{ color: theme.palette.primary.main, mb: 1 }}>
                        {format.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {format.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Generate Button */}
            <Box component={"div" as any} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                disabled={loading}
                onClick={() => {
                  setReportType('events');
                  setReportFormat('pdf');
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleGenerate}
                disabled={loading || !dateFrom || !dateTo}
                startIcon={loading ? <CircularProgress size={20} /> : <ReportIcon />}
              >
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Report Preview / Info */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, boxShadow: theme.shadows[3], height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Información del Reporte
            </Typography>

            <Box component={"div" as any} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Tipo:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {getReportTypeLabel(reportType)}
              </Typography>
            </Box>

            <Box component={"div" as any} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Formato:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {reportFormat.toUpperCase()}
              </Typography>
            </Box>

            <Box component={"div" as any} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Rango:
              </Typography>
              <Typography variant="body1">
                {dateFrom && dateTo
                  ? `${format(new Date(dateFrom), 'dd MMM yyyy', { locale: es })} - ${format(
                      new Date(dateTo),
                      'dd MMM yyyy',
                      { locale: es }
                    )}`
                  : 'No seleccionado'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              El reporte incluirá todos los datos del período seleccionado y estará disponible
              para descarga inmediatamente después de la generación.
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: theme.shadows[3] }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Reportes Recientes
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Formato</TableCell>
                    <TableCell>Fecha Generación</TableCell>
                    <TableCell>Tamaño</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayReports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {report.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getReportTypeLabel(report.type)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getFormatIcon(report.format)}
                          <Typography variant="body2">
                            {report.format.toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.generatedDate), 'dd MMM yyyy HH:mm', {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell align="center">
                        <Box component={"div" as any} sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Vista Previa">
                            <IconButton size="small">
                              <PreviewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar">
                            <IconButton size="small" color="primary">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsGenerator;
