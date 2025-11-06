import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Download, Eye, Calendar, Clock, CheckCircle } from 'lucide-react';
import { UserDashboardService, UserCertificate } from '@/services/userDashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';

const PersonalDashboardTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { withErrorHandling } = useErrorHandler();

  // Cargar certificados del usuario
  const loadCertificates = async () => {
    try {
      setLoading(true);
      const certificatesData = await withErrorHandling(async () => {
        return UserDashboardService.getUserCertificates();
      }, 'Error cargando certificados');

      // Asegurar que siempre sea un array
      setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar certificado
  const handleDownloadCertificate = async (certificateId: number) => {
    try {
      const download = withErrorHandling(async () => {
        const blob = await UserDashboardService.downloadCertificate(certificateId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 'Error descargando certificado');

      await download();
      toast.success('Certificado descargado exitosamente');
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  useEffect(() => {
    loadCertificates();
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
  const userStats = {
    totalCertificates: Array.isArray(certificates) ? certificates.length : 0,
    issuedCertificates: Array.isArray(certificates) ? certificates.filter(c => c.status === 'issued').length : 0,
    pendingCertificates: Array.isArray(certificates) ? certificates.filter(c => c.status === 'pending').length : 0,
    totalHours: 24 // Mock data - debería venir de la API
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        <span className="ml-3 text-gray-600">Cargando certificados...</span>
      </div>
    );
  }

  // Estadísticas del usuario
  const stats = {
    totalCertificates: certificates.length,
    issuedCertificates: certificates.filter(c => c.status === 'issued').length,
    pendingCertificates: certificates.filter(c => c.status === 'pending').length,
    totalHours: 24 // Mock data - debería venir de la API
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
                <p className="text-2xl font-bold">{userStats.totalCertificates}</p>
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
                <p className="text-2xl font-bold">{userStats.issuedCertificates}</p>
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
                <p className="text-2xl font-bold">{userStats.pendingCertificates}</p>
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
                <p className="text-2xl font-bold">{userStats.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de certificados */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No tienes certificados</h3>
            <p className="text-gray-500">Completa eventos para obtener tus certificados</p>
          </CardContent>
        </Card>
      ) : (
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
                        className="flex-1 lg:flex-none border-[#6B1E22] hover:bg-[#6B1E22] hover:text-white"
                        disabled={certificate.status !== 'issued'}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none border-[#6B1E22] hover:bg-[#6B1E22] hover:text-white"
                        onClick={() => handleDownloadCertificate(certificate.id)}
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
      )}

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