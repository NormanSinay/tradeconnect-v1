/**
 * @fileoverview DashboardCharts - Componente de gráficos para dashboard administrativo
 *
 * Arquitectura Recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @version 1.0.0
 * @author TradeConnect Team
 * @license MIT
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
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
         <div className="bg-white/95 border border-border rounded-md p-3 shadow-lg">
           <p className="font-semibold text-sm mb-1">{label}</p>
           {payload.map((entry: any, index: number) => (
             <p
               key={index}
               className="text-sm"
               style={{ color: entry.color }}
             >
               {entry.name}: {entry.value.toLocaleString('es-GT')}
             </p>
           ))}
         </div>
       );
     }
     return null;
   };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Revenue Chart */}
      <div className="lg:col-span-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-1">Ingresos</h3>
                  <p className="text-sm text-muted-foreground">Tendencia de ingresos por período</p>
                </div>
                <select
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value)}
                  className="w-32 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="week">Semana</option>
                  <option value="month">Mes</option>
                  <option value="year">Año</option>
                </select>
              </div>

              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: es })}
                      stroke="#6b7280"
                    />
                    <YAxis
                      tickFormatter={(value) => `Q${value.toLocaleString()}`}
                      stroke="#6b7280"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Ingresos"
                      stroke="#1976d2"
                      strokeWidth={3}
                      dot={{ fill: '#1976d2', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Events by Category Pie Chart */}
      <div className="lg:col-span-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-1">Eventos por Categoría</h3>
              <p className="text-sm text-muted-foreground mb-4">Distribución de eventos</p>

              {loading ? (
                <Skeleton className="h-[250px] w-[250px] rounded-full mx-auto" />
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
      </div>

      {/* Registrations Timeline */}
      <div className="lg:col-span-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">Inscripciones</h3>
                <p className="text-sm text-muted-foreground">Evolución de inscripciones por día</p>
              </div>

              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.registrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: es })}
                      stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Inscripciones"
                      fill="#388e3c"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardCharts;
