import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  MapPin
} from 'lucide-react';
import { UserDashboardService, UserRegistration } from '@/services/userDashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import toast from 'react-hot-toast';

const RegistrationTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { withErrorHandling } = useErrorHandler();

  // Cargar inscripciones del usuario
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const registrationsData = await withErrorHandling(async () => {
        return UserDashboardService.getUserRegistrations();
      }, 'Error cargando inscripciones');

      setRegistrations(registrationsData || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'refunded': return 'Reembolsado';
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

  const filteredRegistrations = registrations.filter(registration => {
    const now = new Date();
    const eventDate = new Date(registration.eventDate);

    switch (filter) {
      case 'upcoming':
        return eventDate >= now && registration.status !== 'cancelled';
      case 'completed':
        return registration.status === 'completed';
      case 'pending':
        return registration.status === 'pending';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        <span className="ml-3 text-gray-600">Cargando inscripciones...</span>
      </div>
    );
  }

  const pendingPayments = registrations.filter(r => r.paymentStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Alertas de pagos pendientes */}
      {pendingPayments > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Pagos Pendientes:</strong> Tienes {pendingPayments} pago(s) pendiente(s) de procesamiento.
            <Button variant="outline" size="sm" className="ml-4">
              Ver detalles
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
        >
          Todas ({registrations.length})
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('upcoming')}
          className={filter === 'upcoming' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
        >
          Próximas
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
        >
          Completadas
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
          className={filter === 'pending' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
        >
          Pendientes
        </Button>
      </div>

      {/* Tabla de inscripciones */}
      {registrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No tienes inscripciones</h3>
            <p className="text-gray-500 mb-4">Explora el catálogo de eventos y inscríbete a uno</p>
            <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
              Ver Catálogo de Eventos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mis Inscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Modalidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.eventTitle}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {registration.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(registration.eventDate)}</div>
                          <div className="text-gray-500">{registration.eventTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getModalityText(registration.modality)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(registration.status)}>
                          {getStatusText(registration.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(registration.paymentStatus)}>
                          {getPaymentStatusText(registration.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        Q{registration.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {registration.qrCode && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {registration.paymentStatus === 'pending' && (
                            <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049]">
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#4CAF50]" />
              <div>
                <p className="text-sm text-gray-600">Total Inscripciones</p>
                <p className="text-2xl font-bold">{registrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">
                  {registrations.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Próximas</p>
                <p className="text-2xl font-bold">
                  {registrations.filter(r => r.status === 'confirmed' && new Date(r.eventDate) >= new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Invertido</p>
                <p className="text-2xl font-bold">
                  Q{registrations.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationTab;