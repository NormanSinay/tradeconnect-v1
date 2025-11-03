import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  Download,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Mail
} from 'lucide-react';

interface Certificate {
  id: number;
  eventTitle: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'issued' | 'pending' | 'processing';
  downloadUrl?: string;
  verificationUrl?: string;
  emailSent: boolean;
  attendancePercentage: number;
}

const CertificateReceptionTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const certificates: Certificate[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-11-15',
      issueDate: '2024-11-16',
      certificateNumber: 'CERT-PART-2024-001',
      status: 'issued',
      downloadUrl: '#',
      verificationUrl: '#',
      emailSent: true,
      attendancePercentage: 95
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-10-20',
      issueDate: '2024-10-21',
      certificateNumber: 'CERT-PART-2024-002',
      status: 'issued',
      downloadUrl: '#',
      verificationUrl: '#',
      emailSent: true,
      attendancePercentage: 100
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-11-25',
      issueDate: '2024-11-26',
      certificateNumber: 'CERT-PART-2024-003',
      status: 'processing',
      emailSent: false,
      attendancePercentage: 85
    },
    {
      id: 4,
      eventTitle: 'Workshop Liderazgo Transformacional',
      eventDate: '2024-12-01',
      issueDate: '',
      certificateNumber: '',
      status: 'pending',
      emailSent: false,
      attendancePercentage: 0
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
      case 'issued': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'Emitido';
      case 'processing': return 'Procesando';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const issuedCertificates = certificates.filter(c => c.status === 'issued').length;
  const processingCertificates = certificates.filter(c => c.status === 'processing').length;
  const pendingCertificates = certificates.filter(c => c.status === 'pending').length;

  const averageAttendance = certificates
    .filter(c => c.attendancePercentage > 0)
    .reduce((sum, c) => sum + c.attendancePercentage, 0) /
    certificates.filter(c => c.attendancePercentage > 0).length || 0;

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <Award className="h-4 w-4" />
        <AlertDescription>
          <strong>Recepción de Certificados:</strong> Los certificados se emiten automáticamente
          al completar los eventos con asistencia validada. Recibirás notificaciones por email.
        </AlertDescription>
      </Alert>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Certificados Emitidos</p>
                <p className="text-2xl font-bold">{issuedCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold">{processingCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{pendingCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Asistencia Promedio</p>
                <p className="text-2xl font-bold">{Math.round(averageAttendance)}%</p>
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
                  {certificate.issueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Fecha de emisión: {formatDate(certificate.issueDate)}</span>
                    </div>
                  )}
                  {certificate.certificateNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Número: {certificate.certificateNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Asistencia: {certificate.attendancePercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>Email enviado: {certificate.emailSent ? 'Sí' : 'No'}</span>
                  </div>
                </div>

                {/* Barra de progreso de asistencia */}
                {certificate.attendancePercentage > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Porcentaje de asistencia</span>
                      <span className="font-medium text-gray-900">{certificate.attendancePercentage}%</span>
                    </div>
                    <Progress value={certificate.attendancePercentage} className="h-2" />
                  </div>
                )}

                {/* Estado del certificado */}
                {certificate.status === 'issued' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Tu certificado está listo para descargar. También puedes verificarlo online.
                    </AlertDescription>
                  </Alert>
                )}

                {certificate.status === 'processing' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-yellow-800">
                      Tu certificado está siendo procesado. Recibirás una notificación cuando esté disponible.
                    </AlertDescription>
                  </Alert>
                )}

                {certificate.status === 'pending' && (
                  <Alert className="border-gray-200 bg-gray-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-gray-800">
                      Certificado pendiente. Completa el evento y valida tu asistencia para obtenerlo.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  {certificate.status === 'issued' && (
                    <>
                      <Button className="flex-1 bg-[#607D8B] hover:bg-[#546E7A]">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Online
                      </Button>
                    </>
                  )}
                  {certificate.status === 'processing' && (
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Procesando...
                    </Button>
                  )}
                  {certificate.status === 'pending' && (
                    <Button variant="outline" className="w-full" disabled>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Pendiente de completar evento
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
                <li>• Completa el evento con asistencia validada (mínimo 75% de asistencia)</li>
                <li>• Los certificados se generan automáticamente al finalizar el evento</li>
                <li>• Recibirás notificación por email cuando esté disponible</li>
                <li>• Puedes descargar el PDF o compartir el enlace de verificación</li>
                <li>• Los certificados incluyen código QR para validación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateReceptionTab;