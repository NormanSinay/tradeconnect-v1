import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  CheckCircle,
  Clock,
  Download,
  Eye,
  AlertTriangle,
  Receipt
} from 'lucide-react';

interface ClientPayment {
  id: number;
  eventTitle: string;
  amount: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  invoiceNumber?: string;
}

const ClientPaymentsTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const payments: ClientPayment[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      amount: 150,
      paymentDate: '2024-10-20',
      status: 'paid',
      paymentMethod: 'Tarjeta de Crédito',
      transactionId: 'TXN-2024-001',
      invoiceNumber: 'INV-2024-001'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      amount: 75,
      paymentDate: '2024-10-25',
      status: 'paid',
      paymentMethod: 'Transferencia Bancaria',
      transactionId: 'TXN-2024-002',
      invoiceNumber: 'INV-2024-002'
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      amount: 120,
      paymentDate: '2024-11-01',
      status: 'pending',
      paymentMethod: 'Tarjeta de Crédito',
      transactionId: 'TXN-2024-003'
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          <strong>Historial de Pagos:</strong> Aquí puedes ver todos tus pagos realizados
          y gestionar los pendientes. Todas las transacciones incluyen comprobante fiscal.
        </AlertDescription>
      </Alert>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Pagos Completados</p>
                <p className="text-2xl font-bold">{paidPayments}</p>
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
              <Receipt className="w-8 h-8 text-[#795548]" />
              <div>
                <p className="text-sm text-gray-600">Total Pagado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
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
            <strong>⚠️ Pagos Pendientes:</strong> Tienes {pendingPayments} pago(s) pendiente(s) de procesamiento.
            Completa estos pagos para asegurar tu participación en los eventos.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>ID Transacción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.eventTitle}
                    </TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.transactionId}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === 'paid' && payment.invoiceNumber && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.status === 'pending' && (
                          <Button size="sm" className="bg-[#795548] hover:bg-[#6d4c41]">
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

      {/* Información sobre métodos de pago */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CreditCard className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Métodos de Pago Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-1">💳 Tarjetas de Crédito/Débito</h4>
                  <p>Visa, Mastercard, American Express</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🏦 Transferencia Bancaria</h4>
                  <p>Bancos locales y transferencias ACH</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📱 Billeteras Digitales</h4>
                  <p>PayPal, criptomonedas (próximamente)</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🧾 Facturación FEL</h4>
                  <p>Comprobantes fiscales electrónicos</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPaymentsTab;