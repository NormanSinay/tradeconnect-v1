import React, { Suspense } from 'react';
import { Box, Container, Typography, Grid, useTheme, useMediaQuery, Button, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { publicEventsService } from '@/services/api';
import { Link } from 'react-router-dom';
import { Event as EventIcon, People as PeopleIcon, School as SchoolIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

// Removed 3D canvas import for better performance and compatibility

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch featured events
  const { data: featuredEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => publicEventsService.getEvents({ featured: true, limit: 6 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock stats for now - will be replaced with real API call
  const stats = {
    totalEvents: 150,
    totalUsers: 2500,
    totalCertificates: 1200,
    totalRevenue: 45000,
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  // Extract gradient colors to avoid TypeScript union complexity
  const primaryColor = String(theme.palette.primary.main);
  const secondaryColor = String(theme.palette.secondary.main);

  const content = (
    <Box
      component={"div" as any}
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}05)`,
        backgroundColor: 'background.default'
      }}
    >
      {/* Hero Section */}
      <Box
        component={"section" as any}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}10)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Pattern */}
        {!isMobile && (
          <Box
            component={"div" as any}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle at 20% 80%, ${primaryColor}20 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, ${secondaryColor}15 0%, transparent 50%),
                          radial-gradient(circle at 40% 40%, ${primaryColor}10 0%, transparent 50%)`,
              animation: 'float 20s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                '33%': { transform: 'translateY(-10px) rotate(1deg)' },
                '66%': { transform: 'translateY(5px) rotate(-1deg)' },
              },
            }}
          >
            {/* Floating geometric shapes */}
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: 60,
                height: 60,
                background: `linear-gradient(45deg, ${primaryColor}30, ${secondaryColor}20)`,
                borderRadius: '50%',
                animation: 'bounce 8s ease-in-out infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-20px)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '60%',
                right: '15%',
                width: 40,
                height: 40,
                background: `linear-gradient(45deg, ${secondaryColor}25, ${primaryColor}15)`,
                borderRadius: 2,
                transform: 'rotate(45deg)',
                animation: 'spin 12s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(45deg)' },
                  '100%': { transform: 'rotate(405deg)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                bottom: '30%',
                left: '70%',
                width: 80,
                height: 80,
                background: `linear-gradient(45deg, ${primaryColor}20, ${secondaryColor}30)`,
                borderRadius: '50%',
                animation: 'pulse 6s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.1)', opacity: 1 },
                },
              }}
            />
          </Box>
        )}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 'bold',
                    mb: 2,
                    background: `linear-gradient(135deg, ${primaryColor}, #D4AF37)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  TradeConnect
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 3,
                    color: 'text.secondary',
                  }}
                >
                  Plataforma E-commerce de Eventos y Cursos Empresariales
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
                  Conectamos empresas con profesionales para el desarrollo continuo.
                  Facturación FEL Guatemala incluida.
                </Typography>
                <Box component={"div" as any} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/events"
                    sx={{
                      backgroundColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                  >
                    Explorar Eventos
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    Ver Demo
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            {isMobile && (
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Box
                    component={"div" as any}
                    sx={{
                      height: 300,
                      background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${primaryColor}30`,
                    }}
                  >
                    <Typography variant="h5" color="primary" textAlign="center">
                      Plataforma E-commerce<br/>de Eventos
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box component={"section" as any} sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" textAlign="center" sx={{ mb: 6, fontWeight: 'bold' }}>
              Nuestros Números
            </Typography>
            <Grid container spacing={4}>
              {[
                { icon: <EventIcon />, label: 'Eventos Activos', value: stats.totalEvents },
                { icon: <PeopleIcon />, label: 'Usuarios Registrados', value: stats.totalUsers },
                { icon: <SchoolIcon />, label: 'Certificados Emitidos', value: stats.totalCertificates },
                { icon: <TrendingUpIcon />, label: 'Ingresos Generados', value: `Q${stats.totalRevenue.toLocaleString()}` },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: 3,
                        '&:hover': { boxShadow: 6 },
                      }}
                    >
                      <Box component={"div" as any} sx={{ color: 'primary.main', fontSize: 48, mb: 2 }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Featured Events Section */}
      <Box component={"section" as any} sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box component={"header" as any} sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                Eventos Destacados
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Descubre los eventos más populares y mejor valorados
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {(featuredEvents?.data || []).map((event: any, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      component={Link}
                      to={`/events/${event.id}`}
                      sx={{
                        height: '100%',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={event.image || '/placeholder-event.jpg'}
                        alt={event.title}
                      />
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {event.title}
                        </Typography>
                        <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={event.category} size="small" color="primary" />
                          <Chip label={event.modality} size="small" variant="outlined" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {event.date} • {event.location}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                          {event.price === 0 ? 'Gratis' : `Q${event.price}`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            <Box component={"div" as any} sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/events"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                Ver Todos los Eventos
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box component={"section" as any} sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" textAlign="center" sx={{ mb: 6, fontWeight: 'bold' }}>
              Categorías de Eventos
            </Typography>
            <Grid container spacing={3}>
              {[
                { name: 'Tecnología', icon: '💻', color: '#1976D2' },
                { name: 'Negocios', icon: '💼', color: '#388E3C' },
                { name: 'Marketing', icon: '📈', color: '#F57C00' },
                { name: 'Finanzas', icon: '💰', color: '#7B1FA2' },
                { name: 'Recursos Humanos', icon: '👥', color: '#D32F2F' },
                { name: 'Salud', icon: '🏥', color: '#00796B' },
              ].map((category, index) => (
                <Grid item xs={6} md={4} key={category.name}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <Box component={"div" as any} sx={{ fontSize: 48, mb: 2 }}>
                        {category.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {category.name}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {content}
    </motion.div>
  );
};

export default HomePage;