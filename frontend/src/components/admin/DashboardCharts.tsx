import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface ChartData {
  revenue?: Array<{ date: string; amount: number }>;
  eventsByCategory?: Array<{ name: string; value: number }>;
  registrations?: Array<{ date: string; count: number }>;
}

interface DashboardChartsProps {
  data?: ChartData;
  loading?: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, loading = false }) => {
  const theme = useTheme();
  const [revenuePeriod, setRevenuePeriod] = React.useState('month');

  // Default data for demonstration
  const defaultData: ChartData = {
    revenue: [
      { date: '2025-10-01', amount: 5000 },
      { date: '2025-10-02', amount: 7500 },
      { date: '2025-10-03', amount: 6200 },
      { date: '2025-10-04', amount: 8900 },
      { date: '2025-10-05', amount: 12000 },
      { date: '2025-10-06', amount: 9500 },
      { date: '2025-10-07', amount: 11000 },
    ],
    eventsByCategory: [
      { name: 'Tecnología', value: 35 },
      { name: 'Negocios', value: 28 },
      { name: 'Marketing', value: 18 },
      { name: 'Finanzas', value: 12 },
      { name: 'RRHH', value: 7 },
    ],
    registrations: [
      { date: '2025-10-01', count: 45 },
      { date: '2025-10-02', count: 62 },
      { date: '2025-10-03', count: 51 },
      { date: '2025-10-04', count: 78 },
      { date: '2025-10-05', count: 95 },
      { date: '2025-10-06', count: 70 },
      { date: '2025-10-07', count: 88 },
    ],
  };

  const chartData = data || defaultData;

  // Colors for pie chart
  const COLORS = ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#D32F2F', '#00796B'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          component={"div" as any}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color, fontSize: '0.875rem' }}
            >
              {entry.name}: {entry.value.toLocaleString('es-GT')}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      {/* Revenue Chart */}
      <Grid item xs={12} lg={8}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ height: '100%', boxShadow: theme.shadows[3] }}>
            <CardContent>
              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box component={"div" as any}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Ingresos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tendencia de ingresos por período
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={revenuePeriod}
                    label="Período"
                    onChange={(e) => setRevenuePeriod(e.target.value)}
                  >
                    <MenuItem value="week">Semana</MenuItem>
                    <MenuItem value="month">Mes</MenuItem>
                    <MenuItem value="year">Año</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: es })}
                      stroke={theme.palette.text.secondary}
                    />
                    <YAxis
                      tickFormatter={(value) => `Q${value.toLocaleString()}`}
                      stroke={theme.palette.text.secondary}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Ingresos"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      {/* Events by Category Pie Chart */}
      <Grid item xs={12} lg={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{ height: '100%', boxShadow: theme.shadows[3] }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Eventos por Categoría
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Distribución de eventos
              </Typography>

              {loading ? (
                <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.eventsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.eventsByCategory?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      {/* Registrations Timeline */}
      <Grid item xs={12}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ boxShadow: theme.shadows[3] }}>
            <CardContent>
              <Box component={"div" as any} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Inscripciones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Evolución de inscripciones por día
                </Typography>
              </Box>

              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.registrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: es })}
                      stroke={theme.palette.text.secondary}
                    />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Inscripciones"
                      fill={theme.palette.success.main}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Grid>
  );
};

export default DashboardCharts;
