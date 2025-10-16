import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Computer as TechIcon,
  School as EducationIcon,
  LocalHospital as HealthIcon,
  TrendingUp as MarketingIcon,
  AccountBalance as FinanceIcon,
  Gavel as LegalIcon,
  People as HRIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    icon: <BusinessIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
  {
    id: 2,
    name: 'Tecnología',
    description: 'Innovación, software y transformación digital',
    color: '#1976D2',
    icon: <TechIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
  {
    id: 3,
    name: 'Salud',
    description: 'Medicina, bienestar y salud ocupacional',
    color: '#388E3C',
    icon: <HealthIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
  {
    id: 4,
    name: 'Educación',
    description: 'Formación profesional y capacitación',
    color: '#F57C00',
    icon: <EducationIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
  {
    id: 5,
    name: 'Marketing',
    description: 'Estrategias de marketing y ventas',
    color: '#E63946',
    icon: <MarketingIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
  {
    id: 6,
    name: 'Finanzas',
    description: 'Gestión financiera y contabilidad',
    color: '#7B1FA2',
    icon: <FinanceIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
  {
    id: 7,
    name: 'Legal',
    description: 'Derecho empresarial y cumplimiento',
    color: '#455A64',
    icon: <LegalIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
  {
    id: 8,
    name: 'Recursos Humanos',
    description: 'Gestión de talento y desarrollo organizacional',
    color: '#00897B',
    icon: <HRIcon sx={{ fontSize: 48 }} />,
    isActive: true,
  },
];

interface CategoriesGridProps {
  categories?: EventCategory[];
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Map API categories to include icons, or use defaults
  const displayCategories: CategoryWithIcon[] = categories
    ? categories.map((cat) => ({
        ...cat,
        icon: <BusinessIcon sx={{ fontSize: 48 }} />, // Default icon for API categories
      }))
    : defaultCategories;

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/events?categoryId=${categoryId}`);
  };

  return (
    <Box
      component={"div" as any}
      sx={{
        py: 8,
        background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
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
              mb: 2,
            }}
          >
            Explora por Categoría
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              mb: 6,
              color: 'grey.400',
            }}
          >
            Encuentra eventos especializados para tu área de interés
          </Typography>
        </motion.div>

        {/* Categories Grid */}
        <Grid container spacing={3}>
          {displayCategories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: `0 8px 32px ${category.color}44`,
                      borderColor: category.color,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCategoryClick(category.id)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        p: 3,
                        height: '100%',
                      }}
                    >
                      {/* Icon */}
                      <Box
                        component={"div" as any}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${category.color}22 0%, ${category.color}44 100%)`,
                          color: category.color,
                          mb: 2,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {category.icon || <BusinessIcon sx={{ fontSize: 48 }} />}
                      </Box>

                      {/* Category Name */}
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 'bold',
                          color: 'white',
                        }}
                      >
                        {category.name}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'grey.400',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {category.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CategoriesGrid;
