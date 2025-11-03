import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Award,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface ClientCertificate {
  id: number;
  eventTitle: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'available' | 'not_available';
  downloadUrl?: string;
  verificationUrl?: string;
}

const ClientCertificatesTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const certificates: ClientCertificate[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-10-15',
      issueDate: '2024-10-16',
      certificateNumber: 'CERT-CLI-2024-001',
      status: 'available',
      downloadUrl: '#',
      verificationUrl: '#'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-10-20',
      issueDate: '2024-10-21',
      certificateNumber: 'CERT-CLI-2024-002',
      status: 'available',
      downloadUrl: '#',
      verificationUrl: '#'
    }
  ];

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
      case 'available': return 'bg-green-100 text-green-800';
      case 'not_available': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'not_available': return 'No Disponible';
      default: return status;
    }
  };

  const availableCertificates = certificates.filter(c => c.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <Award className="h-4 w-4" />
        <AlertDescription>
          <strong>Certificados de Participación:</strong> Los certificados están disponibles
          para descarga una vez completado el evento y procesados los pagos correspondientes.
        </AlertDescription>
      </Alert>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-[#795548]" />
              <div>
                <p className="text-sm text-gray-600">Certificados Disponibles</p>
                <p className="text-2xl font-bold">{availableCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de certificados */}
      <div className="space-y-4">
        {certificates.map((certificate, index) => (
          <motion.div
            key={certificate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{certificate.eventTitle}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Evento realizado el {formatDate(certificate.eventDate)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(certificate.status)}>
                    {getStatusText(certificate.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Información del certificado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Fecha de emisión:</span>
                    <br />
                    {formatDate(certificate.issueDate)}
                  </div>
                  <div>
                    <span className="font-medium">Número de certificado:</span>
                    <br />
                    <span className="font-mono">{certificate.certificateNumber}</span>
                  </div>
                </div>

                {/* Estado del certificado */}
                {certificate.status === 'available' ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Tu certificado está listo para descargar. También puedes verificarlo online.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-gray-200 bg-gray-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-gray-800">
                      Certificado no disponible. Completa el evento y verifica el estado de tu pago.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  {certificate.status === 'available' ? (
                    <>
                      <Button className="flex-1 bg-[#795548] hover:bg-[#6d4c41]">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Online
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verificar
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      No Disponible
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Información sobre certificados */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">¿Cómo obtengo mis certificados?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Completa el evento al que te inscribiste</li>
                <li>• Asegúrate de que tu pago esté completado</li>
                <li>• Los certificados se generan automáticamente</li>
                <li>• Recibirás notificación por email cuando estén listos</li>
                <li>• Puedes descargar el PDF o compartir el enlace de verificación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCertificatesTab;