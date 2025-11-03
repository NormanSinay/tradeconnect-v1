import React, { useState } from 'react';
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

interface Registration {
  id: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  amount: number;
  registrationDate: string;
  qrCode?: string;
}

const RegistrationTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');

  // Mock data - será reemplazado con datos reales de la API
  const registrations: Registration[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-11-15',
      eventTime: '09:00 - 17:00',
      location: 'Centro de Convenciones, Guatemala',
      modality: 'presencial',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 150,
      registrationDate: '2024-10-20',
      qrCode: 'QR123456'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-11-20',
      eventTime: '14:00 - 18:00',
      location: 'Online - Zoom',
      modality: 'virtual',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 75,
      registrationDate: '2024-10-25',
      qrCode: 'QR789012'
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-09-10',
      eventTime: '08:00 - 12:00',
      location: 'Hotel Marriott, Guatemala',
      modality: 'hibrido',
      status: 'completed',
      paymentStatus: 'paid',
      amount: 120,
      registrationDate: '2024-08-15',
      qrCode: 'QR345678'
    }
  ];

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