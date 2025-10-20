/**
 * @fileoverview MyCertificates Component - Arquitectura React/Astro + Tailwind CSS + shadcn/ui
 *
 * Arquitectura recomendada para migración:
 * React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui (componentes UI)
 * → Tailwind CSS (estilos) → Radix UI (primitivos accesibles) → Lucide Icons (iconos)
 *
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Componente para gestión de certificados del usuario.
 * Compatible con SSR de Astro y optimizado para performance.
 */

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
  AlertTriangle,
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
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar certificados. Por favor intenta de nuevo.
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-6">Mis Certificados</h2>
        <Alert>
          <GraduationCap className="h-4 w-4" />
          <AlertDescription>
            No tienes certificados aún. Los certificados se generan automáticamente al
            completar eventos con asistencia confirmada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          Mis Certificados ({certificates.length})
        </h2>
        <Button
          variant="outline"
          onClick={handleDownloadAll}
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar Todos
        </Button>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
            {/* Certificate Preview/Thumbnail */}
            <div
              className="h-48 bg-gray-100 flex items-center justify-center cursor-pointer relative border-b"
              onClick={() => handlePreviewOpen(certificate)}
            >
              <GraduationCap className="w-20 h-20 text-primary opacity-30" />

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant={certificate.status === 'issued' ? 'default' : 'secondary'}>
                  {certificate.status === 'issued' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {getStatusText(certificate.status)}
                    </>
                  ) : (
                    getStatusText(certificate.status)
                  )}
                </Badge>
              </div>

              {/* Blockchain Badge */}
              {certificate.blockchainTxHash && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant="outline">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Blockchain
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="flex flex-col flex-1">
              {/* Event Title */}
              <h3 className="text-lg font-semibold mb-2">
                {certificate.registration?.event?.title || 'Evento'}
              </h3>

              {/* Certificate Details */}
              <div className="mb-4 flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  Certificado #{certificate.certificateNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Emitido: {formatDate(certificate.issuedAt)}
                </p>
                {certificate.expiresAt && (
                  <p className="text-sm text-gray-600">
                    Vence: {formatDate(certificate.expiresAt)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleDownloadCertificate(certificate.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShareCertificate(certificate)}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Compartir
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handlePreviewOpen(certificate)}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Ver QR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Vista Previa del Certificado</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handlePreviewClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <DialogContent>
          {selectedCertificate && (
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold mb-2">
                {selectedCertificate.registration?.event?.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Certificado #{selectedCertificate.certificateNumber}
              </p>

              {/* Certificate Preview Placeholder */}
              <div className="w-full h-64 mx-auto my-6 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <GraduationCap className="w-24 h-24 text-gray-400" />
                {/* TODO: Implement actual certificate preview/PDF viewer */}
              </div>

              {/* QR Code for Verification */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">
                  Código de Verificación
                </h4>
                <div className="w-32 h-32 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Hash: {selectedCertificate.hash.substring(0, 20)}...
                </p>
              </div>

              {selectedCertificate.blockchainTxHash && (
                <Alert className="mt-4">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    Este certificado está anclado en blockchain y puede ser verificado de
                    forma independiente.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button
            onClick={() =>
              selectedCertificate && handleDownloadCertificate(selectedCertificate.id)
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              selectedCertificate && handleShareCertificate(selectedCertificate)
            }
          >
            <Share className="mr-2 h-4 w-4" />
            Compartir
          </Button>
          <Button variant="outline" onClick={handlePreviewClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MyCertificates;
