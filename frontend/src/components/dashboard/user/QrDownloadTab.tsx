import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  QrCode,
  Download,
  Eye,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { UserDashboardService, QrCodeData } from '@/services/userDashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';

const QrDownloadTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [selectedQr, setSelectedQr] = useState<QrCodeData | null>(null);
  const [qrCodes, setQrCodes] = useState<QrCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { withErrorHandling } = useErrorHandler();

  // Cargar códigos QR del usuario
  const loadQrCodes = async () => {
    try {
      setLoading(true);
      const qrCodesData = await withErrorHandling(async () => {
        return UserDashboardService.getUserQrCodes();
      }, 'Error cargando códigos QR');

      setQrCodes(qrCodesData || []);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      setQrCodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar código QR
  const handleDownloadQr = async (qrId: number) => {
    try {
      const download = withErrorHandling(async () => {
        const blob = await UserDashboardService.downloadQrCode(qrId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codigo-qr-${qrId}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 'Error descargando código QR');

      await download();
      toast.success('Código QR descargado exitosamente');
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  useEffect(() => {
    loadQrCodes();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'used': return 'Utilizado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'Virtual';
      case 'presencial': return 'Presencial';
      case 'hibrido': return 'Híbrido';
      default: return modality;
    }
  };

  const handleDownload = (qrItem: QrCodeData) => {
    handleDownloadQr(qrItem.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        <span className="ml-3 text-gray-600">Cargando códigos QR...</span>
      </div>
    );
  }

  const activeQrs = qrCodes.filter(qr => qr.status === 'active').length;
  const usedQrs = qrCodes.filter(qr => qr.status === 'used').length;

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <QrCode className="h-4 w-4" />
        <AlertDescription>
          <strong>ℹ️ Información importante:</strong> Tus códigos QR son únicos y personales.
          Asegúrate de descargarlos antes del evento y tenerlos disponibles para el check-in.
        </AlertDescription>
      </Alert>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-[#4CAF50]" />
              <div>
                <p className="text-sm text-gray-600">Total QR</p>
                <p className="text-2xl font-bold">{qrCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{activeQrs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Utilizados</p>
                <p className="text-2xl font-bold">{usedQrs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de códigos QR */}
      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No tienes códigos QR</h3>
            <p className="text-gray-500">Inscríbete a eventos para obtener tus códigos de acceso</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {qrCodes.map((qrItem, index) => (
            <motion.div
              key={qrItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{qrItem.eventTitle}</CardTitle>
                    <Badge className={getStatusColor(qrItem.status)}>
                      {getStatusText(qrItem.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información del evento */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(qrItem.eventDate)} - {qrItem.eventTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{qrItem.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-xs">{qrItem.qrCode}</span>
                    </div>
                  </div>

                  {/* Preview del QR (mock) */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Generado: {formatDate(qrItem.generatedDate)}</p>
                    <p>Descargas: {qrItem.downloadCount}</p>
                    <p>Modalidad: {getModalityText(qrItem.modality)}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedQr(qrItem)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#4CAF50] hover:bg-[#45a049]"
                      onClick={() => handleDownload(qrItem)}
                      disabled={qrItem.status !== 'active'}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>

                  {qrItem.status === 'used' && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 text-sm">
                        Este código QR ya fue utilizado para el check-in del evento.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de vista previa (simulado) */}
      {selectedQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selectedQr.eventTitle}</h3>
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            <p className="text-center font-mono text-sm mb-4">{selectedQr.qrCode}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedQr(null)}
              >
                Cerrar
              </Button>
              <Button
                className="flex-1 bg-[#4CAF50] hover:bg-[#45a049]"
                onClick={() => {
                  handleDownload(selectedQr);
                  setSelectedQr(null);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrDownloadTab;