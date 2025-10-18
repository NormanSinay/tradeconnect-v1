import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Bug,
  Shield,
  AlertTriangle,
  HelpCircle,
  Send,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ReportIssuePage: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    severity: 'medium',
    subject: '',
    description: '',
    steps: '',
    browser: '',
    device: '',
    attachments: [] as File[],
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
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitMessage('¡Reporte enviado exitosamente! Nuestro equipo de seguridad revisará tu reporte y te contactaremos si necesitamos más información.');
      setFormData({
        name: '',
        email: '',
        issueType: '',
        severity: 'medium',
        subject: '',
        description: '',
        steps: '',
        browser: '',
        device: '',
        attachments: [],
      });
    } catch (error) {
      setSubmitMessage('Error al enviar el reporte. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const issueTypes = [
    {
      value: 'security',
      label: 'Vulnerabilidad de Seguridad',
      icon: <SecurityIcon sx={{ color: 'error.main' }} />,
      description: 'Problemas de seguridad, acceso no autorizado, etc.',
    },
    {
      value: 'bug',
      label: 'Error Técnico (Bug)',
      icon: <BugIcon sx={{ color: 'warning.main' }} />,
      description: 'Funcionalidades que no funcionan correctamente.',
    },
    {
      value: 'performance',
      label: 'Problema de Rendimiento',
      icon: <WarningIcon sx={{ color: 'info.main' }} />,
      description: 'Lentitud, crashes, o problemas de usabilidad.',
    },
    {
      value: 'content',
      label: 'Contenido Inapropiado',
      icon: <WarningIcon sx={{ color: 'error.main' }} />,
      description: 'Contenido ofensivo, spam, o violaciones.',
    },
    {
      value: 'other',
      label: 'Otro',
      icon: <HelpIcon sx={{ color: 'primary.main' }} />,
      description: 'Cualquier otro tipo de problema.',
    },
  ];

  const severityLevels = [
    { value: 'low', label: 'Baja', color: 'success' as const, description: 'Problema menor que no afecta funcionalidad crítica' },
    { value: 'medium', label: 'Media', color: 'warning' as const, description: 'Problema que afecta algunas funcionalidades' },
    { value: 'high', label: 'Alta', color: 'error' as const, description: 'Problema grave que impide el uso normal' },
    { value: 'critical', label: 'Crítica', color: 'error' as const, description: 'Vulnerabilidad de seguridad o fallo total del sistema' },
  ];

  return (
    <Box component={"div" as any} sx={{ minHeight: '100vh', py: 6 }}>
      {/* Hero Section */}
      <Box
        component={"div" as any}
        sx={{
          background: 'linear-gradient(135deg, #D32F2F, #B71C1C)',
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
            Reportar Problema
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              opacity: 0.9,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Ayúdanos a mejorar TradeConnect reportando bugs, vulnerabilidades de seguridad
            o cualquier problema que encuentres en la plataforma.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Important Notice */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Información Importante
          </Typography>
          <Typography variant="body2">
            • Los reportes de vulnerabilidades de seguridad serán tratados con la máxima confidencialidad<br />
            • Incluye tantos detalles como sea posible para ayudar a nuestro equipo a resolver el problema<br />
            • Si reportas una vulnerabilidad de seguridad, recibirás reconocimiento en nuestro programa de bug bounty
          </Typography>
        </Alert>

        <Grid container spacing={4}>
          {/* Report Form */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
                Detalles del Reporte
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
                      label="Email de contacto"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Te contactaremos usando este email"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Tipo de Problema</InputLabel>
                      <Select
                        name="issueType"
                        value={formData.issueType}
                        onChange={handleSelectChange}
                        label="Tipo de Problema"
                      >
                        {issueTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box component={"ul" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {type.icon}
                              <Box component={"ul" as any}>
                                <Typography variant="body1">{type.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {type.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl component="fieldset" required>
                      <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                        Nivel de Severidad
                      </FormLabel>
                      <RadioGroup
                        name="severity"
                        value={formData.severity}
                        onChange={handleInputChange}
                        row
                      >
                        {severityLevels.map((level) => (
                          <FormControlLabel
                            key={level.value}
                            value={level.value}
                            control={<Radio />}
                            label={
                              <Box component={"ul" as any}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {level.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {level.description}
                                </Typography>
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Asunto del reporte"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      placeholder="Breve descripción del problema"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descripción detallada"
                      name="description"
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      placeholder="Describe el problema con el mayor detalle posible..."
                      helperText="Incluye qué esperabas que sucediera vs. qué sucedió realmente"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pasos para reproducir"
                      name="steps"
                      multiline
                      rows={3}
                      value={formData.steps}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="1. Ir a... 2. Hacer clic en... 3. Resultado esperado..."
                      helperText="Ayuda a nuestro equipo a reproducir el problema"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Navegador"
                      name="browser"
                      value={formData.browser}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="Ej: Chrome 91.0, Firefox 89.0"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Dispositivo/Sistema Operativo"
                      name="device"
                      value={formData.device}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="Ej: Windows 10, iPhone 12, MacBook Pro"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Adjuntar Archivos (opcional)
                    </Typography>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.txt,.log"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outlined" component="span" sx={{ mb: 2 }}>
                        Seleccionar Archivos
                      </Button>
                    </label>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Tipos permitidos: imágenes, PDF, archivos de texto, logs. Máximo 10MB por archivo.
                    </Typography>

                    {formData.attachments.length > 0 && (
                      <Box component={"ul" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.attachments.map((file, index) => (
                          <Chip
                            key={index}
                            label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`}
                            onDelete={() => removeAttachment(index)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Al enviar este reporte, aceptas que TradeConnect use la información proporcionada
                      únicamente para investigar y resolver el problema reportado.
                    </Typography>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      color="error"
                      sx={{
                        minWidth: 200,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                      endIcon={<SendIcon />}
                    >
                      {isSubmitting ? 'Enviando Reporte...' : 'Enviar Reporte'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>

          {/* Guidelines & Info */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Guías para Reportes Efectivos
              </Typography>

              <Box component={"ul" as any}sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Para Bugs Técnicos:
                </Typography>
                <Box component={"ul" as any} sx={{ paddingLeft: '20px', margin: 0 }}>
                  <Box component={"li" as any} sx={{ marginBottom: '8px', color: 'text.secondary' }}>
                    Incluye pasos detallados para reproducir el error
                  </Box>
                  <Box component={"li" as any} sx={{ marginBottom: '8px', color: 'text.secondary' }}>
                    Menciona el navegador y sistema operativo
                  </Box>
                  <Box component={"li" as any} sx={{ marginBottom: '8px', color: 'text.secondary' }}>
                    Adjunta capturas de pantalla si es posible
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box component={"ul" as any} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                  Para Vulnerabilidades de Seguridad:
                </Typography>
                <Box component={"ul" as any} sx={{ paddingLeft: '20px', margin: 0 }}>
                  <Box component={"li" as any} sx={{ marginBottom: '8px', color: 'text.secondary' }}>
                    No explotes la vulnerabilidad más allá de lo necesario
                  </Box>
                  <Box component={"li" as any} sx={{ marginBottom: '8px', color: 'text.secondary' }}>
                    Mantén confidencial la información hasta que sea corregida
                  </Box>
                  <Box component={"li" as any} sx={{ marginBottom: '8px', color: 'text.secondary' }}>
                    Incluye proof-of-concept si es seguro
                  </Box>
                </Box>
              </Box>

              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Programa Bug Bounty:</strong> Los reportes válidos de
                  vulnerabilidades pueden ser elegibles para recompensas.
                </Typography>
              </Alert>
            </Card>

            <Card sx={{ p: 4 }}>
              <Typography variant="h5" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Tiempo de Respuesta
              </Typography>

              <Box component={"ul" as any} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PriorityIcon sx={{ mr: 2, color: 'error.main' }} />
                <Box component={"ul" as any}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Crítico/Seguridad
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Respuesta en 4 horas
                  </Typography>
                </Box>
              </Box>

              <Box component={"ul" as any} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box component={"ul" as any}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Alto
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Respuesta en 24 horas
                  </Typography>
                </Box>
              </Box>

              <Box component={"ul" as any} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BugIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box component={"ul" as any} >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Medio/Bajo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Respuesta en 48-72 horas
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportIssuePage;