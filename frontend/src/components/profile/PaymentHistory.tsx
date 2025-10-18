import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  Receipt,
  Refresh,
  Eye,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '@/services/api';
import type { Payment, ApiResponse } from '@/types';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const PaymentHistory: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch payment history
  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payment-history', page, rowsPerPage],
    queryFn: async () => {
      const response: ApiResponse<{
        payments: Payment[];
        total: number;
      }> = await paymentsService.getPaymentHistory({
        page: page + 1,
        limit: rowsPerPage,
      });
      return response.data;
    },
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadInvoice = async (paymentId: number) => {
    try {
      toast.loading('Descargando factura...');
      // TODO: Implement invoice download
      // const blob = await paymentsService.downloadInvoice(paymentId);
      toast.dismiss();
      toast.success(`Descargando factura para pago #${paymentId}...`);
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar factura');
      console.error('Download error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: 'GTQ' | 'USD') => {
    const symbol = currency === 'USD' ? '$' : 'Q';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getStatusColor = (
    status: Payment['status']
  ): 'default' | 'warning' | 'success' | 'error' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'error';
      case 'refunded':
      case 'partially_refunded':
        return 'default';
      case 'disputed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Payment['status']): string => {
    const statusMap: Record<Payment['status'], string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
      partially_refunded: 'Reembolso Parcial',
      disputed: 'En Disputa',
      expired: 'Expirado',
    };
    return statusMap[status] || status;
  };

  const getGatewayText = (gateway: Payment['gateway']): string => {
    const gatewayMap: Record<Payment['gateway'], string> = {
      paypal: 'PayPal',
      stripe: 'Stripe',
      neonet: 'NeoNet',
      bam: 'BAM',
    };
    return gatewayMap[gateway] || gateway;
  };

  if (isLoading) {
    return (
      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar historial de pagos. Por favor intenta de nuevo.
        <Button size="small" onClick={() => refetch()} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  const payments = paymentsData?.payments || [];
  const total = paymentsData?.total || 0;

  if (payments.length === 0) {
    return (
      <Box component={"div" as any}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Historial de Pagos
        </Typography>
        <Alert severity="info" icon={<Receipt />}>
          No tienes pagos registrados aún.
        </Alert>
      </Box>
    );
  }

  return (
    <Box component={"div" as any}>
      {/* Header */}
      <Box
        component={"div" as any}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Historial de Pagos
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          size="small"
        >
          Actualizar
        </Button>
      </Box>

      {/* Payments Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID Transacción</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Evento</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Monto
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Estado
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow
                key={payment.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                {/* Transaction ID */}
                <TableCell>
                  <Tooltip title={payment.transactionId}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {payment.transactionId}
                    </Typography>
                  </Tooltip>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(payment.createdAt)}
                  </Typography>
                </TableCell>

                {/* Event Description */}
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 250 }}>
                    {payment.description || `Pago #${payment.id}`}
                  </Typography>
                </TableCell>

                {/* Gateway */}
                <TableCell>
                  <Chip
                    label={getGatewayText(payment.gateway)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                {/* Amount */}
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(payment.amount, payment.currency)}
                  </Typography>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <Chip
                    label={getStatusText(payment.status)}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="center">
                  <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        color="primary"
                        // onClick={() => handleViewDetails(payment.id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {payment.status === 'completed' && (
                      <Tooltip title="Descargar factura">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownloadInvoice(payment.id)}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>

      {/* Summary */}
      <Box component={"div" as any} sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Total de pagos
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {total}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Pagos completados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {payments.filter((p) => p.status === 'completed').length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Pagos pendientes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {payments.filter((p) => p.status === 'pending').length}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Import Grid for summary section
import { Grid } from '@mui/material';

export default PaymentHistory;
