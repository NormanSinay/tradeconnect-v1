import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  Business as BusinessIcon,
  Support as SupportIcon,
  ReportProblem as ReportIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ContactPage: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitMessage('¡Mensaje enviado exitosamente! Te responderemos en las próximas 24 horas.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
      });
    } catch (error) {
      setSubmitMessage('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: <EmailIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Email',
      description: 'Respuesta en menos de 24 horas',
      contact: 'info@tradeconnect.gt',
      action: 'mailto:info@tradeconnect.gt',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Teléfono',
      description: 'Lunes a Viernes, 8:00 - 17:00',
      contact: '+502 1234-5678',
      action: 'tel:+50212345678',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Chat en Vivo',
      description: 'Soporte instantáneo',
      contact: 'Disponible ahora',
      action: '#',
    },
  ];

  const departments = [
    {
      icon: <BusinessIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Ventas Empresariales',
      description: 'Soluciones para empresas y equipos grandes',
      email: 'ventas@tradeconnect.gt',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Soporte Técnico',
      description: 'Ayuda con problemas técnicos y plataforma',
      email: 'soporte@tradeconnect.gt',
    },
    {
      icon: <ReportIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Reportar Problemas',
      description: 'Incidentes de seguridad y bugs',
      email: 'seguridad@tradeconnect.gt',
    },
  ];

  return (
    <Box component={"div" as any} sx={{ minHeight: '100vh', py: 6 }}>
      {/* Hero Section */}
      <Box
        component={"div" as any}
        sx={{
          background: 'linear-gradient(135deg, #6B1E22, #4B1518)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Contactanos
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Estamos aquí para ayudarte. Elige la mejor forma de contactarnos
            o envíanos un mensaje directamente.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Contact Methods */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {contactMethods.map((method, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box component={"div" as any} sx={{ mb: 3 }}>
                    {method.icon}
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    {method.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {method.description}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                    {method.contact}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    href={method.action}
                    sx={{ minWidth: 120 }}
                  >
                    Contactar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
                Envíanos un Mensaje
              </Typography>

              {submitMessage && (
                <Alert
                  severity={submitMessage.includes('exitosamente') ? 'success' : 'error'}
                  sx={{ mb: 3 }}
                >
                  {submitMessage}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Asunto"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Categoría</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleSelectChange}
                        label="Categoría"
                      >
                        <MenuItem value="general">Consulta General</MenuItem>
                        <MenuItem value="support">Soporte Técnico</MenuItem>
                        <MenuItem value="sales">Ventas</MenuItem>
                        <MenuItem value="billing">Facturación</MenuItem>
                        <MenuItem value="partnership">Alianzas</MenuItem>
                        <MenuItem value="other">Otro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mensaje"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      placeholder="Describe tu consulta o problema en detalle..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      sx={{
                        minWidth: 200,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                      endIcon={<SendIcon />}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>

          {/* Departments & Office Info */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Departamentos
              </Typography>

              {departments.map((dept, index) => (
                <Box component={"div" as any} key={index} sx={{ mb: 3 }}>
                  <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {dept.icon}
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
                      {dept.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {dept.description}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {dept.email}
                  </Typography>
                  {index < departments.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Card>

            <Card sx={{ p: 4 }}>
              <Typography variant="h5" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Oficina Central
              </Typography>

              <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationIcon sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                <Box component={"div" as any}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Ciudad de Guatemala
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Zona 10, Centro Empresarial<br />
                    Torre Internacional, Nivel 15<br />
                    Guatemala, C.A.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Horarios de Atención
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Lunes - Viernes:</strong> 8:00 - 17:00
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Sábados:</strong> 9:00 - 13:00
              </Typography>
              <Typography variant="body2">
                <strong>Domingos:</strong> Cerrado
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Box component={"div" as any} sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            ¿Necesitas ayuda inmediata?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Revisa nuestro centro de ayuda para encontrar respuestas rápidas a preguntas comunes,
            o explora nuestras guías detalladas para aprovechar al máximo TradeConnect.
          </Typography>

          <Box component={"div" as any} sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="outlined" size="large" href="/help">
              Centro de Ayuda
            </Button>
            <Button variant="outlined" size="large" href="/faq">
              Preguntas Frecuentes
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactPage;