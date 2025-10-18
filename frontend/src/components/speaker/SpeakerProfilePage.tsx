import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  DollarSign,
  Star,
  Edit,
  Linkedin,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box component={"div" as any} sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const SpeakerProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock data
  const speakerProfile = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+502 1234-5678',
    bio: 'Experto en transformación digital con más de 15 años de experiencia. Apasionado por la innovación tecnológica y el liderazgo empresarial.',
    specialties: ['Transformación Digital', 'Inteligencia Artificial', 'Liderazgo'],
    linkedinUrl: 'https://linkedin.com/in/juanperez',
    websiteUrl: 'https://juanperez.com',
    rating: 4.7,
    totalEvaluations: 24,
  };

  const contracts = [
    {
      id: 1,
      eventTitle: 'Transformación Digital 2024',
      type: 'Keynote Speaker',
      fee: 5000,
      status: 'active',
      signedDate: '2024-01-15',
      eventDate: '2024-03-15',
    },
    {
      id: 2,
      eventTitle: 'Innovación Tecnológica',
      type: 'Panel Moderator',
      fee: 3000,
      status: 'pending',
      signedDate: '2024-02-01',
      eventDate: '2024-03-20',
    },
  ];

  const payments = [
    {
      id: 1,
      eventTitle: 'Liderazgo Digital',
      amount: 5000,
      status: 'paid',
      paidDate: '2024-02-15',
      method: 'Transferencia Bancaria',
    },
    {
      id: 2,
      eventTitle: 'IA en Empresas',
      amount: 4000,
      status: 'pending',
      dueDate: '2024-03-20',
      method: 'Cheque',
    },
  ];

  const evaluations = [
    {
      id: 1,
      eventTitle: 'Transformación Digital',
      rating: 5,
      date: '2024-02-10',
      attendees: 150,
      comments: 8,
      highlights: [
        { category: 'Contenido', score: 4.9 },
        { category: 'Presentación', score: 5.0 },
        { category: 'Interacción', score: 4.8 },
      ],
    },
    {
      id: 2,
      eventTitle: 'Liderazgo en la Era Digital',
      rating: 4.5,
      date: '2024-01-20',
      attendees: 200,
      comments: 12,
      highlights: [
        { category: 'Contenido', score: 4.7 },
        { category: 'Presentación', score: 4.5 },
        { category: 'Interacción', score: 4.3 },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => `Q${amount.toLocaleString()}`;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Profile Info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {speakerProfile.firstName[0]}
              {speakerProfile.lastName[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <Box component={"div" as any}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {speakerProfile.firstName} {speakerProfile.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {speakerProfile.email} • {speakerProfile.phone}
                </Typography>
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Rating value={speakerProfile.rating} readOnly precision={0.1} />
                  <Typography variant="body2">
                    {speakerProfile.rating} ({speakerProfile.totalEvaluations} evaluaciones)
                  </Typography>
                </Box>
                <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {speakerProfile.specialties.map((specialty) => (
                    <Chip key={specialty} label={specialty} color="primary" size="small" />
                  ))}
                </Box>
                <Box component={"div" as any} sx={{ display: 'flex', gap: 2 }}>
                  {speakerProfile.linkedinUrl && (
                    <Button
                      size="small"
                      startIcon={<LinkedIn />}
                      href={speakerProfile.linkedinUrl}
                      target="_blank"
                    >
                      LinkedIn
                    </Button>
                  )}
                  {speakerProfile.websiteUrl && (
                    <Button
                      size="small"
                      startIcon={<Language />}
                      href={speakerProfile.websiteUrl}
                      target="_blank"
                    >
                      Sitio Web
                    </Button>
                  )}
                </Box>
              </Box>
              <Button variant="outlined" startIcon={<Edit />}>
                Editar Perfil
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<Description />} label="Contratos" />
          <Tab icon={<AttachMoney />} label="Pagos" />
          <Tab icon={<Star />} label="Evaluaciones" />
        </Tabs>

        {/* Contracts Tab */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Evento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Honorarios</TableCell>
                  <TableCell>Fecha del Evento</TableCell>
                  <TableCell>Firmado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.eventTitle}</TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(contract.fee)}
                    </TableCell>
                    <TableCell>
                      {new Date(contract.eventDate).toLocaleDateString('es-GT')}
                    </TableCell>
                    <TableCell>
                      {new Date(contract.signedDate).toLocaleDateString('es-GT')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contract.status === 'active' ? 'Activo' : 'Pendiente'}
                        color={getStatusColor(contract.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small">Ver Contrato</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box component={"div" as any} sx={{ mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(5000)}
                    </Typography>
                    <Typography variant="body2">Total Pagado (este mes)</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(4000)}
                    </Typography>
                    <Typography variant="body2">Pendiente de Pago</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(18000)}
                    </Typography>
                    <Typography variant="body2">Total Año 2024</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Evento</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.eventTitle}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      {payment.status === 'paid'
                        ? new Date(payment.paidDate!).toLocaleDateString('es-GT')
                        : `Vence: ${new Date(payment.dueDate!).toLocaleDateString('es-GT')}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small">Ver Recibo</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Evaluations Tab */}
        <TabPanel value={activeTab} index={2}>
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id} sx={{ mb: 3 }}>
              <CardContent>
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box component={"div" as any}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {evaluation.eventTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(evaluation.date).toLocaleDateString('es-GT')} • {evaluation.attendees}{' '}
                      asistentes
                    </Typography>
                  </Box>
                  <Box component={"div" as any} sx={{ textAlign: 'right' }}>
                    <Rating value={evaluation.rating} readOnly precision={0.1} />
                    <Typography variant="body2">{evaluation.comments} comentarios</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Desglose por Categoría
                </Typography>
                <Grid container spacing={2}>
                  {evaluation.highlights.map((highlight) => (
                    <Grid item xs={12} sm={4} key={highlight.category}>
                      <Typography variant="body2" gutterBottom>
                        {highlight.category}
                      </Typography>
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(highlight.score / 5) * 100}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {highlight.score}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box component={"div" as any} sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined">
                    Ver Todos los Comentarios
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SpeakerProfilePage;
