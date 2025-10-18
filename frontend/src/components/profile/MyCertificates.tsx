import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  Share,
  CheckCircle,
  GraduationCap,
  ShieldCheck,
  X,
  QrCode,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { certificatesService } from '@/services/api';
import type { Certificate, ApiResponse } from '@/types';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const MyCertificates: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch user certificates
  const {
    data: certificates,
    isLoading,
    error,
    refetch,
  } = useQuery<Certificate[]>({
    queryKey: ['user-certificates'],
    queryFn: async () => {
      const response: ApiResponse<Certificate[]> =
        await certificatesService.getCertificates({ userId: 'me' });
      return response.data || [];
    },
  });

  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      toast.loading('Descargando certificado...');
      const blob = await certificatesService.downloadCertificate(certificateId);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificado-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Certificado descargado exitosamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar certificado');
      console.error('Download error:', error);
    }
  };

  const handleDownloadAll = async () => {
    if (!certificates || certificates.length === 0) return;

    toast.loading('Preparando descarga de todos los certificados...');

    try {
      // Download each certificate
      for (const cert of certificates) {
        await handleDownloadCertificate(cert.id);
      }
      toast.dismiss();
      toast.success('Todos los certificados descargados');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar certificados');
    }
  };

  const handleShareCertificate = async (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.hash}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Certificado - TradeConnect',
          text: `Verifica mi certificado: ${certificate.certificateNumber}`,
          url: shareUrl,
        });
        toast.success('Certificado compartido');
      } catch (error) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace copiado al portapapeles');
      } catch (error) {
        toast.error('Error al copiar enlace');
      }
    }
  };

  const handlePreviewOpen = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setSelectedCertificate(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (
    status: 'generated' | 'issued' | 'revoked'
  ): 'default' | 'success' | 'error' => {
    switch (status) {
      case 'generated':
        return 'default';
      case 'issued':
        return 'success';
      case 'revoked':
        return 'error';
    }
  };

  const getStatusText = (status: 'generated' | 'issued' | 'revoked'): string => {
    switch (status) {
      case 'generated':
        return 'Generado';
      case 'issued':
        return 'Emitido';
      case 'revoked':
        return 'Revocado';
    }
  };

  if (isLoading) {
    return (
      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar certificados. Por favor intenta de nuevo.
        <Button size="small" onClick={() => refetch()} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <Box component={"div" as any}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Mis Certificados
        </Typography>
        <Alert severity="info" icon={<School />}>
          No tienes certificados aún. Los certificados se generan automáticamente al
          completar eventos con asistencia confirmada.
        </Alert>
      </Box>
    );
  }

  return (
    <Box component={"div" as any}>
      {/* Header */}
      <Box
        component={"div" as any}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Mis Certificados ({certificates.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadAll}
        >
          Descargar Todos
        </Button>
      </Box>

      {/* Certificates Grid */}
      <Grid container spacing={3}>
        {certificates.map((certificate) => (
          <Grid item xs={12} sm={6} md={4} key={certificate.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {/* Certificate Preview/Thumbnail */}
              <CardMedia
                sx={{
                  height: 200,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
                onClick={() => handlePreviewOpen(certificate)}
              >
                <School sx={{ fontSize: 80, color: 'primary.main', opacity: 0.3 }} />

                {/* Status Badge */}
                <Box
                  component={"div" as any}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                >
                  <Chip
                    label={getStatusText(certificate.status)}
                    color={getStatusColor(certificate.status)}
                    size="small"
                    icon={
                      certificate.status === 'issued' ? (
                        <CheckCircle />
                      ) : undefined
                    }
                  />
                </Box>

                {/* Blockchain Badge */}
                {certificate.blockchainTxHash && (
                  <Box
                    component={"div" as any}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                    }}
                  >
                    <Chip
                      label="Blockchain"
                      size="small"
                      icon={<Verified />}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                )}
              </CardMedia>

              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Event Title */}
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                  {certificate.registration?.event?.title || 'Evento'}
                </Typography>

                {/* Certificate Details */}
                <Box component={"div" as any} sx={{ mb: 2, flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Certificado #{certificate.certificateNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emitido: {formatDate(certificate.issuedAt)}
                  </Typography>
                  {certificate.expiresAt && (
                    <Typography variant="body2" color="text.secondary">
                      Vence: {formatDate(certificate.expiresAt)}
                    </Typography>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box component={"div" as any} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleDownloadCertificate(certificate.id)}
                    size="small"
                  >
                    Descargar PDF
                  </Button>
                  <Box component={"div" as any} sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={() => handleShareCertificate(certificate)}
                      size="small"
                    >
                      Compartir
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QrCode />}
                      onClick={() => handlePreviewOpen(certificate)}
                      size="small"
                    >
                      Ver QR
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Certificate Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            component={"div" as any}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Vista Previa del Certificado</Typography>
            <IconButton onClick={handlePreviewClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box component={"div" as any} sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCertificate.registration?.event?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Certificado #{selectedCertificate.certificateNumber}
              </Typography>

              {/* Certificate Preview Placeholder */}
              <Box
                component={"div" as any}
                sx={{
                  width: '100%',
                  height: 400,
                  mx: 'auto',
                  my: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                }}
              >
                <School sx={{ fontSize: 120, color: 'grey.400' }} />
                {/* TODO: Implement actual certificate preview/PDF viewer */}
              </Box>

              {/* QR Code for Verification */}
              <Box component={"div" as any} sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Código de Verificación
                </Typography>
                <Box
                  component={"div" as any}
                  sx={{
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  }}
                >
                  <QrCode sx={{ fontSize: 140, color: 'grey.400' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Hash: {selectedCertificate.hash.substring(0, 20)}...
                </Typography>
              </Box>

              {selectedCertificate.blockchainTxHash && (
                <Alert severity="success" icon={<Verified />} sx={{ mt: 2 }}>
                  Este certificado está anclado en blockchain y puede ser verificado de
                  forma independiente.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() =>
              selectedCertificate && handleDownloadCertificate(selectedCertificate.id)
            }
          >
            Descargar
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() =>
              selectedCertificate && handleShareCertificate(selectedCertificate)
            }
          >
            Compartir
          </Button>
          <Button onClick={handlePreviewClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCertificates;
