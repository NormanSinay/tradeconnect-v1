/**
 * @fileoverview CategoriesGrid - Componente de grid de categorías para la página principal
 * @description Muestra un grid interactivo de categorías de eventos con animaciones y navegación
 *
 * Arquitectura:
 * - React (componentes interactivos) → Componentes con estado y navegación
 * - Astro (routing y SSR) → Compatible con SSR, navegación del lado cliente
 * - shadcn/ui (componentes UI) → Card, Button para interfaz consistente
 * - Tailwind CSS (estilos) → Estilos utilitarios para layout responsivo
 * - Radix UI (primitivos accesibles) → Primitivos en shadcn/ui
 * - Lucide Icons (iconos) → Iconos modernos y consistentes
 *
 * @version 2.0.0
 * @since 2024
 * @author TradeConnect Team
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building as BusinessIcon,
  Monitor as TechIcon,
  GraduationCap as EducationIcon,
  Heart as HealthIcon,
  TrendingUp as MarketingIcon,
  Landmark as FinanceIcon,
  Scale as LegalIcon,
  Users as HRIcon,
} from 'lucide-react';
import type { EventCategory } from '@/types';

// Extended category type for local use only
interface CategoryWithIcon extends Omit<EventCategory, 'icon'> {
  icon: React.ReactElement;
}

const defaultCategories: CategoryWithIcon[] = [
   {
     id: 1,
     name: 'Negocios',
     description: 'Eventos empresariales y desarrollo de negocios',
     color: '#6B1E22',
     icon: <BusinessIcon className="w-12 h-12" />,
     isActive: true,
   },
   {
     id: 2,
     name: 'Tecnología',
     description: 'Innovación, software y transformación digital',
     color: '#1976D2',
     icon: <TechIcon className="w-12 h-12" />,
     isActive: true,
   },
   {
     id: 3,
     name: 'Salud',
     description: 'Medicina, bienestar y salud ocupacional',
     color: '#388E3C',
     icon: <HealthIcon className="w-12 h-12" />,
     isActive: true,
   },
   {
     id: 4,
     name: 'Educación',
     description: 'Formación profesional y capacitación',
     color: '#F57C00',
     icon: <EducationIcon className="w-12 h-12" />,
     isActive: true,
   },
   {
     id: 5,
     name: 'Marketing',
     description: 'Estrategias de marketing y ventas',
     color: '#E63946',
     icon: <MarketingIcon className="w-12 h-12" />,
     isActive: true,
   },
   {
     id: 6,
     name: 'Finanzas',
     description: 'Gestión financiera y contabilidad',
     color: '#7B1FA2',
     icon: <FinanceIcon className="w-12 h-12" />,
     isActive: true,
   },
   {
     id: 7,
     name: 'Legal',
     description: 'Derecho empresarial y cumplimiento',
     color: '#455A64',
     icon: <LegalIcon className="w-12 h-12" />,
     isActive: true,
   },
   {
     id: 8,
     name: 'Recursos Humanos',
     description: 'Gestión de talento y desarrollo organizacional',
     color: '#00897B',
     icon: <HRIcon className="w-12 h-12" />,
     isActive: true,
   },
 ];

interface CategoriesGridProps {
  categories?: EventCategory[];
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  const navigate = useNavigate();

  // Map API categories to include icons, or use defaults
  const displayCategories: CategoryWithIcon[] = categories
    ? categories.map((cat) => ({
        ...cat,
        icon: <BusinessIcon className="w-12 h-12" />, // Default icon for API categories
      }))
    : defaultCategories;

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/events?categoryId=${categoryId}`);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Explora por Categoría
          </h2>
          <p className="text-lg text-center text-gray-300 mb-12">
            Encuentra eventos especializados para tu área de interés
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 cursor-pointer">
                <CardContent
                  className="flex flex-col items-center text-center p-6 h-full"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {/* Icon */}
                  <div
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}22 0%, ${category.color}44 100%)`,
                      color: category.color,
                    }}
                  >
                    {category.icon || <BusinessIcon className="w-12 h-12" />}
                  </div>

                  {/* Category Name */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {category.description}
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

export default CategoriesGrid;
