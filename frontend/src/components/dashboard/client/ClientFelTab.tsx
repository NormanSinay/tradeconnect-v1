import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Receipt,
  Download,
  Eye,
  FileText,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';

interface FelInvoice {
  id: number;
  invoiceNumber: string;
  eventTitle: string;
  issueDate: string;
  amount: number;
  status: 'issued' | 'pending' | 'cancelled';
  felUUID: string;
  felSerie: string;
  downloadUrl?: string;
  verificationUrl?: string;
}

const ClientFelTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const invoices: FelInvoice[] = [
    {
      id: 1,
      invoiceNumber: '001-001-000000001',
      eventTitle: 'Taller de Marketing Digital Avanzado',
      issueDate: '2024-10-20',
      amount: 150,
      status: 'issued',
      felUUID: '12345678-1234-1234-1234-123456789012',
      felSerie: 'FACE-001',
      downloadUrl: '#',
      verificationUrl: '#'
    },
    {
      id: 2,
      invoiceNumber: '001-001-000000002',
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      issueDate: '2024-10-25',
      amount: 75,
      status: 'issued',
      felUUID: '87654321-4321-4321-4321-210987654321',
      felSerie: 'FACE-002',
      downloadUrl: '#',
      verificationUrl: '#'
    },
    {
      id: 3,
      invoiceNumber: '001-001-000000003',
      eventTitle: 'Seminario Gestión del Talento Humano',
      issueDate: '2024-11-01',
      amount: 120,
      status: 'pending',
      felUUID: '',
      felSerie: '',
      downloadUrl: '#',
      verificationUrl: '#'
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
      case 'issued': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'Emitida';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Anulada';
      default: return status;
    }
  };

  const issuedInvoices = invoices.filter(i => i.status === 'issued').length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
  const totalInvoiced = invoices
    .filter(i => i.status === 'issued')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <Receipt className="h-4 w-4" />
        <AlertDescription>
          <strong>Facturas FEL:</strong> Todas las facturas se emiten conforme a la legislación
          guatemalteca de Factura Electrónica (FEL). Puedes descargar y verificar su autenticidad.
        </AlertDescription>
      </Alert>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#795548]" />
              <div>
                <p className="text-sm text-gray-600">Facturas Emitidas</p>
                <p className="text-2xl font-bold">{issuedInvoices}</p>
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
                <p className="text-2xl font-bold">{pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Facturado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de facturas pendientes */}
      {pendingInvoices > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Facturas Pendientes:</strong> Tienes {pendingInvoices} factura(s) en proceso de emisión.
            Recibirás notificación cuando estén disponibles.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Facturas FEL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Factura</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Serie FEL</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.eventTitle}
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {invoice.felSerie || 'Pendiente'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {invoice.status === 'issued' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </>
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

      {/* Información sobre FEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">¿Qué es FEL?</h3>
                <p className="text-sm text-blue-800">
                  FEL (Factura Electrónica) es el sistema obligatorio de facturación electrónica
                  en Guatemala. Todas nuestras facturas cumplen con los requisitos de la SAT
                  y pueden ser verificadas en el portal oficial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Verificación de Facturas</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• UUID único de identificación</li>
                  <li>• Serie y número de factura</li>
                  <li>• Código QR de verificación</li>
                  <li>• Enlace directo al portal SAT</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-gray-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Información Importante</h3>
              <ul className="text-sm text-gray-800 space-y-1">
                <li>• Las facturas FEL tienen validez legal inmediata</li>
                <li>• Puedes descargar tus facturas en formato PDF</li>
                <li>• Conserva tus facturas por al menos 5 años</li>
                <li>• Para consultas sobre facturas, contacta a nuestro soporte</li>
                <li>• Las facturas anuladas aparecen marcadas como "Anulada"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientFelTab;