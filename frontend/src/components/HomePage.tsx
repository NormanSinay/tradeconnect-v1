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
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  // Parallax effect on mouse move
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
    return () => {}; // Explicit return for all code paths
  }, [isMobile]);

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
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const cardHoverVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
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
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
              transition: 'transform 0.3s ease-out',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                '33%': { transform: 'translateY(-20px) rotate(2deg)' },
                '66%': { transform: 'translateY(10px) rotate(-2deg)' },
              },
            }}
          >
            {/* Large floating circles - Layer 1 */}
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '15%',
                left: '8%',
                width: 100,
                height: 100,
                background: `linear-gradient(135deg, ${primaryColor}35, ${secondaryColor}25)`,
                borderRadius: '50%',
                animation: 'bounce1 7s ease-in-out infinite',
                filter: 'blur(1px)',
                '@keyframes bounce1': {
                  '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                  '25%': { transform: 'translate(15px, -25px) scale(1.1)' },
                  '50%': { transform: 'translate(-10px, -40px) scale(0.95)' },
                  '75%': { transform: 'translate(-20px, -15px) scale(1.05)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '10%',
                right: '12%',
                width: 120,
                height: 120,
                background: `linear-gradient(225deg, ${primaryColor}25, #D4AF3730)`,
                borderRadius: '50%',
                animation: 'bounce2 9s ease-in-out infinite',
                filter: 'blur(2px)',
                '@keyframes bounce2': {
                  '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                  '30%': { transform: 'translate(-20px, 30px) scale(1.15)' },
                  '60%': { transform: 'translate(10px, 50px) scale(0.9)' },
                },
              }}
            />

            {/* Medium floating circles - Layer 2 */}
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '45%',
                left: '5%',
                width: 70,
                height: 70,
                background: `radial-gradient(circle, ${primaryColor}40, ${secondaryColor}20)`,
                borderRadius: '50%',
                animation: 'drift1 11s ease-in-out infinite',
                '@keyframes drift1': {
                  '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                  '33%': { transform: 'translate(25px, -20px) rotate(120deg)' },
                  '66%': { transform: 'translate(-15px, 15px) rotate(240deg)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '55%',
                right: '10%',
                width: 90,
                height: 90,
                background: `linear-gradient(45deg, #D4AF3740, ${primaryColor}25)`,
                borderRadius: '50%',
                animation: 'drift2 13s ease-in-out infinite',
                filter: 'blur(1px)',
                '@keyframes drift2': {
                  '0%, 100%': { transform: 'translate(0, 0)' },
                  '25%': { transform: 'translate(-30px, 20px)' },
                  '50%': { transform: 'translate(20px, -30px)' },
                  '75%': { transform: 'translate(-10px, -10px)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                bottom: '20%',
                left: '15%',
                width: 85,
                height: 85,
                background: `linear-gradient(135deg, ${secondaryColor}30, ${primaryColor}35)`,
                borderRadius: '50%',
                animation: 'orbit1 15s linear infinite',
                '@keyframes orbit1': {
                  '0%': { transform: 'rotate(0deg) translateX(30px) rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg) translateX(30px) rotate(-360deg)' },
                },
              }}
            />

            {/* Small accent circles - Layer 3 */}
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '30%',
                left: '25%',
                width: 50,
                height: 50,
                background: `radial-gradient(circle, ${primaryColor}50, transparent)`,
                borderRadius: '50%',
                animation: 'pulse1 5s ease-in-out infinite',
                '@keyframes pulse1': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
                  '50%': { transform: 'scale(1.4)', opacity: 1 },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '70%',
                left: '35%',
                width: 60,
                height: 60,
                background: `radial-gradient(circle, #D4AF3745, transparent)`,
                borderRadius: '50%',
                animation: 'pulse2 6s ease-in-out infinite 1s',
                '@keyframes pulse2': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.3)', opacity: 0.95 },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                bottom: '35%',
                right: '20%',
                width: 55,
                height: 55,
                background: `linear-gradient(45deg, ${primaryColor}40, ${secondaryColor}35)`,
                borderRadius: '50%',
                animation: 'pulse3 7s ease-in-out infinite 2s',
                '@keyframes pulse3': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.65 },
                  '50%': { transform: 'scale(1.35)', opacity: 0.9 },
                },
              }}
            />

            {/* Geometric shapes with rotation */}
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '25%',
                right: '25%',
                width: 50,
                height: 50,
                background: `linear-gradient(45deg, ${secondaryColor}35, ${primaryColor}25)`,
                borderRadius: 2,
                animation: 'spin1 10s linear infinite',
                '@keyframes spin1': {
                  '0%': { transform: 'rotate(0deg) scale(1)' },
                  '50%': { transform: 'rotate(180deg) scale(1.2)' },
                  '100%': { transform: 'rotate(360deg) scale(1)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                bottom: '40%',
                left: '60%',
                width: 45,
                height: 45,
                background: `linear-gradient(225deg, #D4AF3730, ${primaryColor}30)`,
                borderRadius: 2,
                transform: 'rotate(45deg)',
                animation: 'spin2 14s linear infinite reverse',
                '@keyframes spin2': {
                  '0%': { transform: 'rotate(45deg) scale(1)' },
                  '50%': { transform: 'rotate(225deg) scale(0.9)' },
                  '100%': { transform: 'rotate(405deg) scale(1)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '60%',
                right: '30%',
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, ${primaryColor}28, ${secondaryColor}32)`,
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                animation: 'rotate1 12s ease-in-out infinite',
                '@keyframes rotate1': {
                  '0%, 100%': { transform: 'rotate(0deg) translateY(0)' },
                  '50%': { transform: 'rotate(180deg) translateY(-20px)' },
                },
              }}
            />

            {/* Floating particles */}
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                top: '40%',
                left: '45%',
                width: 25,
                height: 25,
                background: `radial-gradient(circle, ${primaryColor}60, transparent)`,
                borderRadius: '50%',
                animation: 'float1 8s ease-in-out infinite',
                '@keyframes float1': {
                  '0%, 100%': { transform: 'translate(0, 0)' },
                  '25%': { transform: 'translate(40px, -60px)' },
                  '50%': { transform: 'translate(80px, -20px)' },
                  '75%': { transform: 'translate(40px, 20px)' },
                },
              }}
            />
            <Box
              component={"div" as any}
              sx={{
                position: 'absolute',
                bottom: '45%',
                right: '40%',
                width: 30,
                height: 30,
                background: `radial-gradient(circle, #D4AF3765, transparent)`,
                borderRadius: '50%',
                animation: 'float2 10s ease-in-out infinite 1.5s',
                '@keyframes float2': {
                  '0%, 100%': { transform: 'translate(0, 0)' },
                  '33%': { transform: 'translate(-50px, 40px)' },
                  '66%': { transform: 'translate(-25px, -30px)' },
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
                    background: `linear-gradient(135deg, ${primaryColor}, #D4AF37, ${primaryColor})`,
                    backgroundSize: '200% 200%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradientShift 4s ease infinite',
                    '@keyframes gradientShift': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                    },
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
                    whileHover={{ scale: 1.05, y: -8 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 300,
                    }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: 3,
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': { boxShadow: 8 },
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
              {(featuredEvents?.data?.events || featuredEvents?.data || []).map((event: any, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{
                      scale: 1.03,
                      y: -12,
                      rotateY: 2,
                      transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                      },
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      component={Link}
                      to={`/events/${event.id}`}
                      sx={{
                        height: '100%',
                        textDecoration: 'none',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: 8,
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
                    initial={{ opacity: 0, scale: 0.8, rotateZ: -5 }}
                    whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
                    whileHover={{
                      scale: 1.08,
                      rotateZ: 3,
                      y: -8,
                      transition: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 12,
                      },
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: 8,
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