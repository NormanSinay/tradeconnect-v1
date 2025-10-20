/**
 * @fileoverview EventIncludes - Componente para mostrar beneficios incluidos en eventos
 * @description Componente React que muestra una lista de beneficios incluidos en eventos con iconos contextuales.
 * Soporta layouts de lista y grid con animaciones suaves y diseño responsivo.
 *
 * Arquitectura:
 * - React: Componentes funcionales con props tipadas
 *   ↓
 * - Astro: Routing y SSR - Compatible con hidratación del lado cliente
 *   ↓
 * - shadcn/ui: Componentes UI preconstruidos (Card)
 *   ↓
 * - Tailwind CSS: Estilos utilitarios para diseño responsivo y moderno
 *   ↓
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 *   ↓
 * - Lucide Icons: Iconografía moderna y consistente (CheckCircle, GraduationCap, FileText, Coffee, Wifi, Car, Utensils, Headphones, Gift, Video, Download, Trophy)
 * - Framer Motion: Animaciones suaves y transiciones fluidas
 *
 * Características:
 * - Mapeo inteligente de iconos basado en contenido
 * - Layouts flexibles (grid/list)
 * - Animaciones de entrada escalonadas
 * - Estados vacíos informativos
 * - Compatibilidad completa con SSR de Astro
 *
 * @version 1.0.0
 * @since 2024
 * @author TradeConnect Team
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle,
  GraduationCap,
  FileText,
  Coffee,
  Wifi,
  Car,
  Utensils,
  Headphones,
  Gift,
  Video,
  Download,
  Trophy,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EventIncludesProps {
  includes: string[];
  layout?: 'list' | 'grid';
}

const EventIncludes: React.FC<EventIncludesProps> = ({ includes, layout = 'grid' }) => {
  const getIconForItem = (item: string): React.ReactNode => {
    const lowerItem = item.toLowerCase();

    if (lowerItem.includes('certificado')) return <GraduationCap className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('material') || lowerItem.includes('documento')) return <FileText className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('coffee break') || lowerItem.includes('café')) return <Coffee className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('wifi') || lowerItem.includes('internet')) return <Wifi className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('parking') || lowerItem.includes('estacionamiento')) return <Car className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('almuerzo') || lowerItem.includes('comida')) return <Utensils className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('soporte') || lowerItem.includes('asistencia')) return <Headphones className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('kit') || lowerItem.includes('regalo')) return <Gift className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('grabación') || lowerItem.includes('video')) return <Video className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('descarga') || lowerItem.includes('recurso')) return <Download className="h-5 w-5 text-primary" />;
    if (lowerItem.includes('premio') || lowerItem.includes('reconocimiento')) return <Trophy className="h-5 w-5 text-primary" />;

    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  if (!includes || includes.length === 0) {
    return (
      <div className="p-6 text-center bg-muted rounded-lg">
        <p className="text-muted-foreground">
          Información sobre lo que incluye el evento estará disponible próximamente
        </p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (layout === 'list') {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {includes.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:bg-muted hover:translate-x-2"
            >
              <div className="flex-shrink-0">
                {getIconForItem(item)}
              </div>
              <span className="text-base font-medium">{item}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {includes.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full flex transition-all duration-300 cursor-default hover:shadow-lg hover:bg-primary/5">
                <CardContent className="flex items-center gap-3 w-full p-4">
                  <div className="flex items-center justify-center min-w-10">
                    {getIconForItem(item)}
                  </div>
                  <span className="flex-1 text-base transition-colors duration-300">
                    {item}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-700" />
        <span className="text-sm text-green-700 font-medium">
          Este evento incluye {includes.length} beneficio{includes.length !== 1 ? 's' : ''} para tu experiencia completa
        </span>
      </div>
    </div>
  );
};

export default EventIncludes;
