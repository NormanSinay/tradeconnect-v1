import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import {
  QrCodeScanner,
  CheckCircle,
  Cancel,
  Person,
  Event,
  AccessTime,
  Refresh,
  Search,
} from '@mui/icons-material';

const OperatorCheckinPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Mock data - Replace with actual API call
  const currentEvent = {
    id: 1,
    title: 'Transformación Digital en Empresas 2024',
    date: '2024-03-15',
    time: '14:00',
    location: 'Auditorio Principal',
    totalRegistrations: 150,
    checkedIn: 87,
  };

  const recentCheckIns = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      ticketNumber: 'TC-2024-001',
      time: '13:45',
      status: 'success',
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria.gonzalez@example.com',
      ticketNumber: 'TC-2024-002',
      time: '13:42',
      status: 'success',
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos.lopez@example.com',
      ticketNumber: 'TC-2024-003',
      time: '13:40',
      status: 'duplicate',
    },
  ];

  const handleScanQR = () => {
    // Simulate QR scan - Replace with actual QR scanner integration
    setTimeout(() => {
      const mockScan = {
        name: 'Pedro Ramírez',
        email: 'pedro.ramirez@example.com',
        ticketNumber: 'TC-2024-125',
        registrationType: 'VIP',
        valid: true,
      };
      setScanResult(mockScan);
      setScanStatus('success');
    }, 1000);
  };

  const handleManualEntry = () => {
    if (!manualCode.trim()) {
      setScanStatus('error');
      return;
    }

    // Simulate manual code validation
    const mockResult = {
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      ticketNumber: manualCode,
      registrationType: 'General',
      valid: true,
    };
    setScanResult(mockResult);
    setScanStatus('success');
    setManualCode('');
  };

  const handleConfirmCheckIn = () => {
    // TODO: Send check-in to backend
    console.log('Check-in confirmed for:', scanResult);
    setScanResult(null);
    setScanStatus('idle');
  };

  const handleCancelCheckIn = () => {
    setScanResult(null);
    setScanStatus('idle');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'duplicate':
        return <Cancel color="error" />;
      default:
        return <Person />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'duplicate':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Check-in de Asistentes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Validación de QR y registro de asistencia
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Scanner & Manual Entry */}
        <Grid item xs={12} md={6}>
          {/* Event Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Evento Actual
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {currentEvent.title}
            </Typography>
            <Box component={"div" as any} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip icon={<AccessTime />} label={currentEvent.time} />
              <Chip label={currentEvent.location} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Progreso de Check-in:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {currentEvent.checkedIn} / {currentEvent.totalRegistrations} (
                {Math.round((currentEvent.checkedIn / currentEvent.totalRegistrations) * 100)}%)
              </Typography>
            </Box>
          </Paper>

          {/* QR Scanner */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Escanear Código QR
            </Typography>
            <Box
              component={"div" as any}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 4,
                bgcolor: 'grey.100',
                borderRadius: 2,
                mb: 2,
              }}
            >
              <QrCodeScanner sx={{ fontSize: 100, color: 'primary.main' }} />
              <Button
                variant="contained"
                size="large"
                startIcon={<QrCodeScanner />}
                onClick={handleScanQR}
              >
                Iniciar Escaneo
              </Button>
            </Box>
          </Paper>

          {/* Manual Entry */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Entrada Manual
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingresa el código del ticket manualmente si el QR no funciona
            </Typography>
            <Box component={"div" as any} sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Ej: TC-2024-001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
              />
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleManualEntry}
              >
                Buscar
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Scan Result & Recent Check-ins */}
        <Grid item xs={12} md={6}>
          {/* Scan Result */}
          {scanResult && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Resultado del Escaneo
              </Typography>

              {scanStatus === 'success' && (
                <>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Código QR válido - Listo para check-in
                  </Alert>

                  <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent>
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: 'success.dark' }}>
                          <Person sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Box component={"div" as any}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {scanResult.name}
                          </Typography>
                          <Typography variant="body2">{scanResult.email}</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2, bgcolor: 'success.dark' }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption">Número de Ticket</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {scanResult.ticketNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Tipo de Registro</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {scanResult.registrationType}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <Box component={"div" as any} sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircle />}
                      onClick={handleConfirmCheckIn}
                      size="large"
                    >
                      Confirmar Check-in
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleCancelCheckIn}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </>
              )}

              {scanStatus === 'error' && (
                <Alert severity="error">
                  Código inválido o ya utilizado. Verifica los datos.
                </Alert>
              )}
            </Paper>
          )}

          {/* Recent Check-ins */}
          <Paper sx={{ p: 3 }}>
            <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Check-ins Recientes
              </Typography>
              <IconButton size="small">
                <Refresh />
              </IconButton>
            </Box>

            <List>
              {recentCheckIns.map((checkin, index) => (
                <React.Fragment key={checkin.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getStatusIcon(checkin.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {checkin.name}
                          </Typography>
                          <Chip
                            label={checkin.status === 'success' ? 'Confirmado' : 'Duplicado'}
                            color={getStatusColor(checkin.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {checkin.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {checkin.ticketNumber} • {checkin.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentCheckIns.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OperatorCheckinPage;
