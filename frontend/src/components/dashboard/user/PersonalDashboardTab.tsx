import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Download, Eye, Calendar, Clock, CheckCircle } from 'lucide-react';

interface Certificate {
  id: number;
  eventTitle: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'issued' | 'pending' | 'expired';
  downloadUrl?: string;
  verificationUrl?: string;
}

const PersonalDashboardTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const certificates: Certificate[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-09-15',
      issueDate: '2024-09-16',
      certificateNumber: 'CERT-2024-001',
      status: 'issued',
      downloadUrl: '#',
      verificationUrl: '#'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-10-20',
      issueDate: '2024-10-21',
      certificateNumber: 'CERT-2024-002',
      status: 'issued',
      downloadUrl: '#',
      verificationUrl: '#'
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-11-10',
      issueDate: '2024-11-11',
      certificateNumber: 'CERT-2024-003',
      status: 'pending',
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
      case 'issued': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'Emitido';
      case 'pending': return 'Pendiente';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  // Estadísticas del usuario
  const stats = {
    totalCertificates: certificates.length,
    issuedCertificates: certificates.filter(c => c.status === 'issued').length,
    pendingCertificates: certificates.filter(c => c.status === 'pending').length,
    totalHours: 24 // Mock data
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-[#4CAF50]" />
              <div>
                <p className="text-sm text-gray-600">Total Certificados</p>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Emitidos</p>
                <p className="text-2xl font-bold">{stats.issuedCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pendingCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Horas Totales</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de certificados */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Certificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{certificate.eventTitle}</h3>
                      <Badge className={getStatusColor(certificate.status)}>
                        {getStatusText(certificate.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fecha del evento:</span>
                        <br />
                        {formatDate(certificate.eventDate)}
                      </div>
                      <div>
                        <span className="font-medium">Fecha de emisión:</span>
                        <br />
                        {formatDate(certificate.issueDate)}
                      </div>
                      <div>
                        <span className="font-medium">Número de certificado:</span>
                        <br />
                        {certificate.certificateNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 lg:flex-col lg:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none"
                      disabled={certificate.status !== 'issued'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none"
                      disabled={certificate.status !== 'issued'}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>

                {certificate.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Tu certificado está siendo procesado. Recibirás una notificación cuando esté disponible.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progreso de formación */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Formación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Horas de formación completadas</span>
                <span className="text-sm text-gray-600">{stats.totalHours}/40 horas</span>
              </div>
              <Progress value={(stats.totalHours / 40) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Te faltan {40 - stats.totalHours} horas para completar tu formación anual
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-800">{stats.issuedCertificates}</p>
                <p className="text-sm text-green-600">Certificados obtenidos</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-blue-800">{Math.round(stats.totalHours / stats.issuedCertificates) || 0}h</p>
                <p className="text-sm text-blue-600">Promedio por evento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDashboardTab;