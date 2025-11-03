import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface ClientRegistration {
  id: number;
  eventTitle: string;
  eventDate: string;
  registrationDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

const ClientRegistrationTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const registrations: ClientRegistration[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-11-15',
      registrationDate: '2024-10-20',
      status: 'confirmed',
      amount: 150,
      paymentStatus: 'paid'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-11-20',
      registrationDate: '2024-10-25',
      status: 'confirmed',
      amount: 75,
      paymentStatus: 'paid'
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-11-25',
      registrationDate: '2024-11-01',
      status: 'pending',
      amount: 120,
      paymentStatus: 'pending'
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
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

  const pendingPayments = registrations.filter(r => r.paymentStatus === 'pending').length;
  const totalSpent = registrations
    .filter(r => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Gestión de Inscripciones:</strong> Aquí puedes ver todas tus inscripciones a eventos
          y gestionar tus registros de manera sencilla.
        </AlertDescription>
      </Alert>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#795548]" />
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
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pagos Pendientes</p>
                <p className="text-2xl font-bold">{pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Invertido</p>
                <p className="text-2xl font-bold">Q{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de pagos pendientes */}
      {pendingPayments > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Pagos Pendientes:</strong> Tienes {pendingPayments} pago(s) pendiente(s).
            Completa tus pagos para confirmar tu participación.
          </AlertDescription>
        </Alert>
      )}

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
                  <TableHead>Fecha del Evento</TableHead>
                  <TableHead>Fecha de Inscripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.eventTitle}
                    </TableCell>
                    <TableCell>{formatDate(registration.eventDate)}</TableCell>
                    <TableCell>{formatDate(registration.registrationDate)}</TableCell>
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
                        {registration.paymentStatus === 'pending' && (
                          <Button size="sm" className="bg-[#795548] hover:bg-[#6d4c41]">
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

      {/* Información adicional */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda con tus inscripciones?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Para modificar una inscripción, contacta al soporte antes de 48 horas del evento</li>
                <li>• Los reembolsos se procesan según la política de cancelación</li>
                <li>• Puedes transferir tu inscripción a otra persona con previa autorización</li>
                <li>• Recibirás confirmación por email una vez completado el pago</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRegistrationTab;