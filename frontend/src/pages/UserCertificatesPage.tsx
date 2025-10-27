import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaDownload, FaEye, FaCertificate } from 'react-icons/fa';

interface Certificate {
  id: number;
  title: string;
  event: string;
  issueDate: string;
  verificationCode: string;
  duration: string;
  status: 'issued' | 'pending' | 'expired';
  image?: string;
}

const UserCertificatesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCertificates();
    }
  }, [isAuthenticated]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada real a la API
      // const response = await fetch('/api/v1/users/certificates');
      // const data = await response.json();

      // Datos mock por ahora
      const mockCertificates: Certificate[] = [
        {
          id: 1,
          title: 'Taller de Finanzas Personales',
          event: 'Taller de Finanzas Personales',
          issueDate: '2023-08-20',
          verificationCode: 'TC-CERT-2023-ABCD1234',
          duration: '16 horas',
          status: 'issued',
          image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 2,
          title: 'Conferencia de Tecnología',
          event: 'Conferencia de Tecnología Empresarial',
          issueDate: '2023-07-25',
          verificationCode: 'TC-CERT-2023-EFGH5678',
          duration: '8 horas',
          status: 'issued',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 3,
          title: 'Curso de Ventas',
          event: 'Curso Avanzado de Técnicas de Ventas',
          issueDate: '2023-06-15',
          verificationCode: 'TC-CERT-2023-IJKL9012',
          duration: '24 horas',
          status: 'issued',
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        }
      ];

      setCertificates(mockCertificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      issued: { label: 'Emitido', variant: 'secondary' as const },
      pending: { label: 'Pendiente', variant: 'default' as const },
      expired: { label: 'Expirado', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    // TODO: Implementar descarga real del PDF
    console.log('Descargando certificado:', certificate.id);
    // Simular descarga
    alert(`Descargando certificado: ${certificate.title}`);
  };

  const handleViewCertificate = (certificate: Certificate) => {
    // TODO: Implementar vista previa del certificado
    console.log('Viendo certificado:', certificate.id);
    // Por ahora, mostrar modal o redirigir a página de vista
    alert(`Viendo certificado: ${certificate.title}`);
  };

  const renderCertificateCard = (certificate: Certificate) => (
    <motion.div
      key={certificate.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {certificate.image && (
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#6B1E22] to-[#8a2b30]">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaCertificate className="text-white text-6xl opacity-50" />
            </div>
            <div className="absolute top-4 right-4">
              {getStatusBadge(certificate.status)}
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">{certificate.title}</h3>
            {!certificate.image && getStatusBadge(certificate.status)}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600 mb-4">{certificate.event}</p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha de Emisión:</span>
              <span className="text-gray-900 font-medium">
                {new Date(certificate.issueDate).toLocaleDateString('es-ES')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Código de Verificación:</span>
              <span className="text-gray-900 font-mono text-xs">
                {certificate.verificationCode}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Duración:</span>
              <span className="text-gray-900 font-medium">{certificate.duration}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleViewCertificate(certificate)}
            >
              <FaEye className="mr-2" />
              Ver Detalles
            </Button>

            <Button
              className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30]"
              onClick={() => handleDownloadCertificate(certificate)}
            >
              <FaDownload className="mr-2" />
              Descargar PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta página.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user?.name}</span>
              <Link to="/dashboard">
                <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
            <p className="mt-2 text-gray-600">
              Certificados obtenidos por completar eventos y cursos
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando certificados...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <FaCertificate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes certificados aún
              </h3>
              <p className="text-gray-600 mb-6">
                Completa eventos y cursos para obtener tus certificados.
              </p>
              <Link to="/events">
                <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                  Explorar Eventos
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {certificates.map(renderCertificateCard)}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Verificación de Certificados
                </h3>
                <p className="text-blue-700 mb-4">
                  Puedes verificar la autenticidad de tus certificados utilizando nuestro{' '}
                  <Link to="/verify" className="underline hover:text-blue-800">
                    sistema de verificación público
                  </Link>
                  .
                </p>
                <div className="text-sm text-blue-600">
                  <p>Para verificar un certificado, utiliza el código de verificación único que aparece en cada certificado.</p>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default UserCertificatesPage;