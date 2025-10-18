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
    icon: <EventIcon />,
    trend: 0,
    format: 'number',
    color: '#1976D2',
  },
  {
    label: 'Ingresos Totales',
    value: 0,
    icon: <AttachMoney />,
    trend: 0,
    format: 'currency',
    color: '#388E3C',
  },
  {
    label: 'Usuarios Activos',
    value: 0,
    icon: <People />,
    trend: 0,
    format: 'number',
    color: '#F57C00',
  },
  {
    label: 'Certificados Emitidos',
    value: 0,
    icon: <CardMembership />,
    trend: 0,
    format: 'number',
    color: '#7B1FA2',
  },
];

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ kpis = defaultKPIs, loading = false }) => {
  const theme = useTheme();

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
      <Grid item xs={12} sm={6} md={3}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              {loading ? (
                <Box component={"div" as any}>
                  <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                </Box>
              ) : (
                <>
                  {/* Icon */}
                  <Box
                    component={"div" as any}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box
                      component={"div" as any}
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${kpi.color || theme.palette.primary.main}15`,
                        color: kpi.color || theme.palette.primary.main,
                      }}
                    >
                      {React.cloneElement(kpi.icon, { sx: { fontSize: 32 } })}
                    </Box>

                    {/* Trend indicator */}
                    {kpi.trend !== undefined && kpi.trend !== 0 && (
                      <Tooltip
                        title={`${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(1)}% vs mes anterior`}
                      >
                        <Box
                          component={"div" as any}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor:
                              kpi.trend > 0
                                ? `${theme.palette.success.main}15`
                                : `${theme.palette.error.main}15`,
                            color:
                              kpi.trend > 0 ? theme.palette.success.main : theme.palette.error.main,
                          }}
                        >
                          {kpi.trend > 0 ? (
                            <TrendingUp sx={{ fontSize: 20 }} />
                          ) : (
                            <TrendingDown sx={{ fontSize: 20 }} />
                          )}
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {Math.abs(kpi.trend).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Value */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      mb: 0.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {formatValue(displayValue, kpi.format)}
                  </Typography>

                  {/* Label */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {kpi.label}
                  </Typography>

                  {/* Decorative gradient */}
                  <Box
                    component={"div" as any}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${kpi.color || theme.palette.primary.main}, ${kpi.color || theme.palette.primary.main}80)`,
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    );
  };

  return (
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.label} kpi={kpi} index={index} />
      ))}
    </Grid>
  );
};

export default DashboardKPIs;
