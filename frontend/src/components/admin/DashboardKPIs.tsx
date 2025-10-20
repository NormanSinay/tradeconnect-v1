/**
 * @fileoverview DashboardKPIs - Componente de indicadores clave de rendimiento para dashboard administrativo
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

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface KPIData {
  label: string;
  value: number | string;
  icon: React.ReactElement;
  trend?: number; // Percentage change (positive or negative)
  format?: 'number' | 'currency' | 'percentage';
  color?: string;
}

interface DashboardKPIsProps {
  kpis?: KPIData[];
  loading?: boolean;
}

const defaultKPIs: KPIData[] = [
   {
     label: 'Total Eventos',
     value: 0,
     icon: <Calendar className="h-6 w-6" />,
     trend: 0,
     format: 'number',
     color: '#1976D2',
   },
   {
     label: 'Ingresos Totales',
     value: 0,
     icon: <DollarSign className="h-6 w-6" />,
     trend: 0,
     format: 'currency',
     color: '#388E3C',
   },
   {
     label: 'Usuarios Activos',
     value: 0,
     icon: <Users className="h-6 w-6" />,
     trend: 0,
     format: 'number',
     color: '#F57C00',
   },
   {
     label: 'Certificados Emitidos',
     value: 0,
     icon: <Award className="h-6 w-6" />,
     trend: 0,
     format: 'number',
     color: '#7B1FA2',
   },
 ];

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ kpis = defaultKPIs, loading = false }) => {

  // Animated counter hook
  const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (loading) return;

      let startTime: number | null = null;
      const startValue = 0;

      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setCount(Math.floor(startValue + (end - startValue) * easedProgress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [end, duration, loading]);

    return count;
  };

  const formatValue = (value: number | string, format?: 'number' | 'currency' | 'percentage') => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return `Q${value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString('es-GT');
    }
  };

  const KPICard: React.FC<{ kpi: KPIData; index: number }> = ({ kpi, index }) => {
     const numericValue = typeof kpi.value === 'number' ? kpi.value : 0;
     const animatedValue = useCountUp(numericValue);
     const displayValue = typeof kpi.value === 'number' ? animatedValue : kpi.value;

     return (
       <div className="col-span-12 sm:col-span-6 md:col-span-3">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: index * 0.1 }}
         >
           <Card className="h-full relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
             <CardContent className="p-6">
               {loading ? (
                 <div>
                   <Skeleton className="w-14 h-14 rounded-full mb-4" />
                   <Skeleton className="h-8 w-3/5 mb-2" />
                   <Skeleton className="h-6 w-2/5" />
                 </div>
               ) : (
                 <>
                   {/* Icon */}
                   <div className="flex items-center justify-between mb-4">
                     <div
                       className="w-14 h-14 rounded-lg flex items-center justify-center"
                       style={{
                         backgroundColor: `${kpi.color || '#1976d2'}15`,
                         color: kpi.color || '#1976d2',
                       }}
                     >
                       {kpi.icon}
                     </div>

                     {/* Trend indicator */}
                     {kpi.trend !== undefined && kpi.trend !== 0 && (
                       <div
                         className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                         style={{
                           backgroundColor: kpi.trend > 0 ? '#388e3c15' : '#d32f2f15',
                           color: kpi.trend > 0 ? '#388e3c' : '#d32f2f',
                         }}
                         title={`${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(1)}% vs mes anterior`}
                       >
                         {kpi.trend > 0 ? (
                           <TrendingUp className="h-4 w-4" />
                         ) : (
                           <TrendingDown className="h-4 w-4" />
                         )}
                         {Math.abs(kpi.trend).toFixed(1)}%
                       </div>
                     )}
                   </div>

                   {/* Value */}
                   <div className="text-2xl font-bold mb-1 text-foreground">
                     {formatValue(displayValue, kpi.format)}
                   </div>

                   {/* Label */}
                   <div className="text-sm text-muted-foreground font-medium">
                     {kpi.label}
                   </div>

                   {/* Decorative gradient */}
                   <div
                     className="absolute bottom-0 left-0 right-0 h-1"
                     style={{
                       background: `linear-gradient(90deg, ${kpi.color || '#1976d2'}, ${kpi.color || '#1976d2'}80)`,
                     }}
                   />
                 </>
               )}
             </CardContent>
           </Card>
         </motion.div>
       </div>
     );
   };

  return (
    <div className="grid grid-cols-12 gap-6">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.label} kpi={kpi} index={index} />
      ))}
    </div>
  );
};

export default DashboardKPIs;
