import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FaCalendarAlt, FaUsers, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import { publicEventsService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile, useIsMediumScreen } from '@/hooks/useMediaQuery';

const HomePageNew: React.FC = () => {
  const isMobile = useIsMobile();
  const isMediumScreen = useIsMediumScreen();
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100">
        {/* Animated Background Pattern */}
        {!isMobile && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            {/* Large floating circles */}
            <div className="absolute top-[15%] left-[8%] w-24 h-24 bg-gradient-to-br from-primary-400/30 to-secondary-300/25 rounded-full blur-sm animate-[bounce_7s_ease-in-out_infinite]" />
            <div className="absolute top-[10%] right-[12%] w-32 h-32 bg-gradient-to-br from-primary-300/25 to-secondary-400/30 rounded-full blur-md animate-[bounce_9s_ease-in-out_infinite]" />

            {/* Medium floating circles */}
            <div className="absolute top-[45%] left-[5%] w-20 h-20 bg-gradient-to-br from-primary-500/40 to-secondary-300/20 rounded-full animate-[spin_11s_linear_infinite]" />
            <div className="absolute top-[55%] right-[10%] w-24 h-24 bg-gradient-to-br from-secondary-500/40 to-primary-300/25 rounded-full blur-sm animate-[spin_13s_linear_infinite_reverse]" />
            <div className="absolute bottom-[20%] left-[15%] w-20 h-20 bg-gradient-to-br from-secondary-400/30 to-primary-400/35 rounded-full animate-[pulse_15s_linear_infinite]" />

            {/* Small accent circles */}
            <div className="absolute top-[30%] left-[25%] w-14 h-14 bg-primary-500/50 rounded-full animate-pulse-slow" />
            <div className="absolute top-[70%] left-[35%] w-16 h-16 bg-secondary-500/45 rounded-full animate-pulse-slow" />
            <div className="absolute bottom-[35%] right-[20%] w-14 h-14 bg-gradient-to-br from-primary-500/40 to-secondary-400/35 rounded-full animate-pulse-slow" />

            {/* Geometric shapes */}
            <div className="absolute top-[25%] right-[25%] w-12 h-12 bg-gradient-to-br from-secondary-400/35 to-primary-300/25 rounded animate-[spin_10s_linear_infinite]" />
            <div className="absolute bottom-[40%] left-[60%] w-11 h-11 bg-gradient-to-br from-secondary-400/30 to-primary-400/30 rounded transform rotate-45 animate-[spin_14s_linear_infinite_reverse]" />

            {/* Triangle */}
            <div
              className="absolute top-[60%] right-[30%] w-10 h-10 bg-gradient-to-br from-primary-400/28 to-secondary-400/32 animate-[spin_12s_ease-in-out_infinite]"
              style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            />

            {/* Floating particles */}
            <div className="absolute top-[40%] left-[45%] w-7 h-7 bg-primary-600/60 rounded-full animate-float" />
            <div className="absolute bottom-[45%] right-[40%] w-8 h-8 bg-secondary-600/65 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
          </div>
        )}

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
                TradeConnect
              </h1>
              <h2 className="text-2xl md:text-3xl mb-6 text-gray-700 font-heading">
                Plataforma E-commerce de Eventos y Cursos Empresariales
              </h2>
              <p className="text-lg mb-8 text-gray-600">
                Conectamos empresas con profesionales para el desarrollo continuo.
                Facturación FEL Guatemala incluida.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg"
                >
                  <Link to="/events">Explorar Eventos</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="shadow-md"
                >
                  Ver Demo
                </Button>
              </div>
            </motion.div>

            {isMobile && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center"
              >
                <div className="h-72 w-full bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-2xl flex items-center justify-center border-2 border-primary-300/30 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-primary-600 text-center px-4">
                    Plataforma E-commerce<br />de Eventos
                  </h3>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-12 font-heading">
              Nuestros Números
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: FaCalendarAlt, label: 'Eventos Activos', value: stats.totalEvents, color: 'text-primary-500' },
                { icon: FaUsers, label: 'Usuarios Registrados', value: stats.totalUsers, color: 'text-success' },
                { icon: FaGraduationCap, label: 'Certificados Emitidos', value: stats.totalCertificates, color: 'text-info' },
                { icon: FaChartLine, label: 'Ingresos Generados', value: `Q${stats.totalRevenue.toLocaleString()}`, color: 'text-secondary-600' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
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
                  <Card className="text-center p-6 h-full hover:shadow-xl">
                    <CardContent className="p-0">
                      <stat.icon className={`text-5xl mx-auto mb-4 ${stat.color}`} />
                      <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 font-heading">
                Eventos Destacados
              </h2>
              <p className="text-gray-600">
                Descubre los eventos más populares y mejor valorados
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(featuredEvents?.data?.events || featuredEvents?.data || []).map((event: any, index: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.03,
                    y: -12,
                    rotateY: 2,
                  }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/events/${event.id}`} className="block h-full">
                    <Card className="h-full overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image || '/placeholder-event.jpg'}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex gap-2 mb-4">
                          <Badge>{event.category}</Badge>
                          <Badge variant="outline">{event.modality}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.date} • {event.location}
                        </p>
                        <p className="text-xl font-bold text-primary-600">
                          {event.price === 0 ? 'Gratis' : `Q${event.price}`}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link to="/events">Ver Todos los Eventos</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-12 font-heading">
              Categorías de Eventos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { name: 'Tecnología', icon: '💻', color: 'from-blue-500 to-blue-600' },
                { name: 'Negocios', icon: '💼', color: 'from-green-500 to-green-600' },
                { name: 'Marketing', icon: '📈', color: 'from-orange-500 to-orange-600' },
                { name: 'Finanzas', icon: '💰', color: 'from-purple-500 to-purple-600' },
                { name: 'Recursos Humanos', icon: '👥', color: 'from-red-500 to-red-600' },
                { name: 'Salud', icon: '🏥', color: 'from-teal-500 to-teal-600' },
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.8, rotateZ: -5 }}
                  whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
                  whileHover={{
                    scale: 1.08,
                    rotateZ: 3,
                    y: -8,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center p-8 cursor-pointer hover:shadow-xl group">
                    <CardContent className="p-0">
                      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <h3 className="text-lg font-bold">{category.name}</h3>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePageNew;
