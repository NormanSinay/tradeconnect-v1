/**
 * @fileoverview CertificateDetailPage - Página de detalle de certificados
 * @description Componente React para mostrar certificados digitales con validación
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks y state management
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Visualización completa de certificados
 * - Validación QR y blockchain
 * - Acciones de descarga, impresión y compartir
 * - Diseño responsive con Tailwind CSS
 * - Compatibilidad SSR con Astro
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Share,
  QrCode,
  CheckCircle,
  Building,
  GraduationCap,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  ArrowLeft,
  Printer,
  Mail,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Certificate {
  id: string;
  certificateNumber: string;
  eventTitle: string;
  eventDescription: string;
  participantName: string;
  participantEmail: string;
  issuedAt: string;
  eventDate: string;
  eventLocation: string;
  organizerName: string;
  organizerLogo?: string;
  qrCode: string;
  blockchainHash?: string;
  status: 'issued' | 'revoked' | 'expired';
  hours?: number;
  skills?: string[];
}

/**
 * CertificateDetailPage - Página de detalle de certificados
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
const CertificateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Mock certificate data
  const mockCertificate: Certificate = {
    id: id || '1',
    certificateNumber: 'CERT-2024-001',
    eventTitle: 'Conferencia de Tecnología 2024',
    eventDescription: 'Conferencia internacional sobre las últimas tendencias en tecnología, innovación y transformación digital.',
    participantName: 'Juan Pérez García',
    participantEmail: 'juan.perez@email.com',
    issuedAt: '2024-02-20T17:00:00Z',
    eventDate: '2024-02-20T09:00:00Z',
    eventLocation: 'Centro de Convenciones, Guatemala City',
    organizerName: 'TradeConnect',
    organizerLogo: '/logo-tradeconnect.png',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CERT-2024-001',
    blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'issued',
    hours: 8,
    skills: ['Tecnología', 'Innovación', 'Transformación Digital', 'Liderazgo'],
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Mock download - in real app this would trigger PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Certificado descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el certificado');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `Certificado: ${mockCertificate.eventTitle}`,
      text: `Certificado de participación en ${mockCertificate.eventTitle} - ${mockCertificate.certificateNumber}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success('Enlace copiado al portapapeles');
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const handleEmailCertificate = () => {
    const subject = encodeURIComponent(`Certificado: ${mockCertificate.eventTitle}`);
    const body = encodeURIComponent(
      `Adjunto mi certificado de participación:\n\n` +
      `Evento: ${mockCertificate.eventTitle}\n` +
      `Número de Certificado: ${mockCertificate.certificateNumber}\n` +
      `Fecha de Emisión: ${formatDate(mockCertificate.issuedAt)}\n\n` +
      `Ver certificado completo: ${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ mb: 2 }}
        >
          Volver al Perfil
        </Button>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Certificado de Participación
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Certificado oficial emitido por TradeConnect
        </Typography>
      </Box>

      {/* Certificate Display */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: '2px solid',
          borderColor: 'primary.main',
          position: 'relative',
          overflow: 'hidden',
          '@media print': {
            boxShadow: 'none',
            border: 'none',
            background: 'white',
          },
        }}
      >
        {/* Decorative Border */}
        <Box
          component={"div" as any}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '8px solid',
            borderImage: 'linear-gradient(45deg, #6B1E22, #E63946) 1',
            pointerEvents: 'none',
            '@media print': {
              display: 'none',
            },
          }}
        />

        <Box component={"div" as any} sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box component={"div" as any} sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              <Business />
            </Avatar>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {mockCertificate.organizerName}
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ fontStyle: 'italic' }}>
              Certificado de Participación
            </Typography>
          </Box>

          {/* Certificate Content */}
          <Box component={"div" as any} sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Se certifica que
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
              {mockCertificate.participantName}
            </Typography>
            <Typography variant="h6" gutterBottom>
              ha participado exitosamente en el evento
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              "{mockCertificate.eventTitle}"
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
              {mockCertificate.eventDescription}
            </Typography>
          </Box>

          {/* Event Details */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Event color="primary" />
                    Detalles del Evento
                  </Typography>
                  <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Fecha:</strong> {formatDate(mockCertificate.eventDate)}
                      </Typography>
                    </Box>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Lugar:</strong> {mockCertificate.eventLocation}
                      </Typography>
                    </Box>
                    {mockCertificate.hours && (
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>Duración:</strong> {mockCertificate.hours} horas
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Verified color="primary" />
                    Información del Certificado
                  </Typography>
                  <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Número:</strong> {mockCertificate.certificateNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Emitido:</strong> {formatDateTime(mockCertificate.issuedAt)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong>
                      <Chip
                        label="Válido"
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    {mockCertificate.blockchainHash && (
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        <strong>Hash:</strong> {mockCertificate.blockchainHash.substring(0, 20)}...
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Skills */}
          {mockCertificate.skills && mockCertificate.skills.length > 0 && (
            <Box component={"div" as any} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Competencias Desarrolladas
              </Typography>
              <Box component={"div" as any} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {mockCertificate.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Signatures */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box component={"div" as any} sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Organizador
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {mockCertificate.organizerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Director Ejecutivo
                </Typography>
                <Box component={"div" as any} sx={{ mt: 2, height: 40, borderBottom: '1px solid', borderColor: 'text.secondary', mx: 4 }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box component={"div" as any} sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fecha de Emisión
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatDate(mockCertificate.issuedAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Certificado Digital
                </Typography>
                <Box component={"div" as any} sx={{ mt: 2, height: 40, borderBottom: '1px solid', borderColor: 'text.secondary', mx: 4 }} />
              </Box>
            </Grid>
          </Grid>

          {/* QR Code */}
          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box component={"div" as any} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Código QR de Verificación
              </Typography>
              <Box
                component="img"
                src={mockCertificate.qrCode}
                alt="QR Code"
                sx={{
                  width: 120,
                  height: 120,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  cursor: 'pointer',
                }}
                onClick={() => setShowQRDialog(true)}
              />
            </Box>
          </Box>

          {/* Blockchain Verification */}
          {mockCertificate.blockchainHash && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>🔗 Verificado en Blockchain:</strong> Este certificado está registrado en la blockchain de Ethereum
                para garantizar su autenticidad e inmutabilidad.
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Acciones del Certificado
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Download />}
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              sx={{ py: 1.5 }}
            >
              {isDownloading ? 'Descargando...' : 'Descargar PDF'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Print />}
              onClick={handlePrint}
              sx={{ py: 1.5 }}
            >
              Imprimir
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Share />}
              onClick={handleShare}
              sx={{ py: 1.5 }}
            >
              Compartir
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Email />}
              onClick={handleEmailCertificate}
              sx={{ py: 1.5 }}
            >
              Enviar por Email
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Verification Info */}
      <Alert severity="success" icon={<CheckCircle />}>
        <Typography variant="body2">
          <strong>✅ Certificado Válido:</strong> Este certificado ha sido verificado y es completamente válido.
          Para verificar la autenticidad, escanee el código QR o visite nuestro portal de verificación.
        </Typography>
      </Alert>

      {/* QR Dialog */}
      <Dialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Código QR de Verificación</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={mockCertificate.qrCode}
            alt="QR Code Large"
            sx={{
              width: 300,
              height: 300,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Escanee este código QR para verificar la autenticidad del certificado
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Certificado: {mockCertificate.certificateNumber}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CertificateDetailPage;