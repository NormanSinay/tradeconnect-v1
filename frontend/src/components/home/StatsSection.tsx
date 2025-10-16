import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import {
  Event as EventIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  BusinessCenter as BusinessIcon,
} from '@mui/icons-material';

interface Stat {
  icon: React.ReactElement;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}

const stats: Stat[] = [
  {
    icon: <EventIcon sx={{ fontSize: 48 }} />,
    value: 500,
    label: 'Eventos Realizados',
    suffix: '+',
    color: '#E63946',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 48 }} />,
    value: 50000,
    label: 'Participantes',
    suffix: '+',
    color: '#6B1E22',
  },
  {
    icon: <TrophyIcon sx={{ fontSize: 48 }} />,
    value: 45000,
    label: 'Certificados Emitidos',
    suffix: '+',
    color: '#E63946',
  },
  {
    icon: <BusinessIcon sx={{ fontSize: 48 }} />,
    value: 200,
    label: 'Empresas Participantes',
    suffix: '+',
    color: '#6B1E22',
  },
];

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 2000,
  suffix = '',
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const StatsSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component={"div" as any}
      sx={{
        py: 8,
        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 6,
            }}
          >
            TradeConnect en Números
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  component={"div" as any}
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 2,
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    component={"div" as any}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 'bold',
                      color: stat.color,
                      mb: 1,
                    }}
                  >
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                    />
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection;
