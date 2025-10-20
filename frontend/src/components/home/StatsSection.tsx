/**
 * @fileoverview StatsSection - Componente de estadísticas animadas para la página principal
 * @description Muestra estadísticas de TradeConnect con contadores animados y diseño moderno
 *
 * Arquitectura:
 * - React (componentes interactivos) → Estado, efectos, animaciones
 * - Astro (routing y SSR) → Compatible con SSR, animaciones del lado cliente
 * - shadcn/ui (componentes UI) → Card para layout consistente
 * - Tailwind CSS (estilos) → Estilos utilitarios para diseño responsivo
 * - Radix UI (primitivos accesibles) → Primitivos en shadcn/ui
 * - Lucide Icons (iconos) → Iconos modernos y consistentes
 *
 * @version 2.0.0
 * @since 2024
 * @author TradeConnect Team
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Users, Trophy, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stat {
  icon: React.ReactElement;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}

const stats: Stat[] = [
  {
    icon: <Calendar className="w-12 h-12" />,
    value: 500,
    label: 'Eventos Realizados',
    suffix: '+',
    color: '#E63946',
  },
  {
    icon: <Users className="w-12 h-12" />,
    value: 50000,
    label: 'Participantes',
    suffix: '+',
    color: '#6B1E22',
  },
  {
    icon: <Trophy className="w-12 h-12" />,
    value: 45000,
    label: 'Certificados Emitidos',
    suffix: '+',
    color: '#E63946',
  },
  {
    icon: <Building className="w-12 h-12" />,
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
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
            TradeConnect en Números
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-0">
                  <div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}44 100%)`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>

                  <h4
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: stat.color }}
                  >
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                    />
                  </h4>

                  <p className="text-gray-600 font-medium">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
