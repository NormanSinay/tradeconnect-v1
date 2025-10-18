import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Download,
  Share,
  Calendar,
  Mail,
  Receipt,
  ArrowRight,
  Home,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  // In a real app, this would come from the payment success response
  const mockOrderData = {
    orderId: `ORD-${Date.now()}`,
    transactionId: `TXN-${Date.now()}`,
    total: cart?.total || 0,
    items: cart?.items || [],
  };

  const formatPrice = (price: number) => `Q${price.toFixed(2)}`;

  const handleDownloadInvoice = () => {
    // Mock download - in real app this would trigger PDF download
    alert('Descargando factura FEL... (simulado)');
  };

  const handleDownloadTickets = () => {
    // Mock download - in real app this would trigger QR/ticket download
    alert('Descargando códigos QR... (simulado)');
  };

  const handleShare = async () => {
    const text = `¡Acabo de inscribirme a eventos en TradeConnect! Orden: ${mockOrderData.orderId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inscripción Exitosa - TradeConnect',
          text,
          url: window.location.origin,
        });
      } catch (error) {
        navigator.clipboard.writeText(`${text} ${window.location.origin}`);
        alert('Enlace copiado al portapapeles');
      }
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-12">
        <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">
          ¡Pago Exitoso!
        </h1>
        <h2 className="text-xl text-muted-foreground mb-2">
          Su inscripción ha sido confirmada
        </h2>
        <p className="text-muted-foreground">
          Recibirá un email de confirmación con todos los detalles
        </p>
      </div>

      {/* Order Details */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Detalles de la Orden
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box component={"div" as any} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Número de Orden
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                {mockOrderData.orderId}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box component={"div" as any} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ID de Transacción
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {mockOrderData.transactionId}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Eventos Inscritos
            </Typography>
          </Grid>
        </Grid>

        {/* Purchased Items */}
        <Box component={"div" as any} sx={{ mt: 2 }}>
          {mockOrderData.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2, display: 'flex' }}>
              <CardMedia
                component="img"
                sx={{ width: 120, height: 80, objectFit: 'cover' }}
                image={item.event?.media?.find(m => m.isPrimary)?.filePath || '/placeholder-event.jpg'}
                alt={item.event?.title}
              />
              <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box component={"div" as any}>
                  <Typography variant="h6" component="h3">
                    {item.event?.title}
                  </Typography>
                  <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={item.event?.eventCategory?.name}
                      size="small"
                      sx={{
                        bgcolor: item.event?.eventCategory?.color,
                        color: 'white',
                      }}
                    />
                    <Chip
                      label={`${item.quantity} ${item.quantity === 1 ? 'entrada' : 'entradas'}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Box component={"div" as any} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(item.total)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(item.finalPrice)} c/u
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Order Summary */}
        <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Total Pagado
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {formatPrice(mockOrderData.total)}
          </Typography>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Próximos Pasos
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Download />}
              onClick={handleDownloadInvoice}
              sx={{ py: 1.5 }}
            >
              Descargar Factura FEL
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<Download />}
              onClick={handleDownloadTickets}
              sx={{ py: 1.5 }}
            >
              Descargar Códigos QR
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Share />}
              onClick={handleShare}
            >
              Compartir
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Event />}
              onClick={() => navigate('/profile')}
            >
              Ver Mis Eventos
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Information Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Email de Confirmación
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recibirá un email con todos los detalles de su compra y los códigos QR para acceder a los eventos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Factura FEL
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Su factura electrónica será generada automáticamente y estará disponible para descarga.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Event sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Recordatorios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recibirá recordatorios automáticos 48 horas antes de cada evento.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Important Information */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Guarde sus códigos QR en un lugar seguro. Son su entrada digital para acceder a los eventos.
          Si tiene alguna duda, puede contactarnos a través del chat de soporte.
        </Typography>
      </Alert>

      {/* Navigation */}
      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          size="large"
        >
          Ir al Inicio
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/events')}
          size="large"
        >
          Explorar Más Eventos
        </Button>
      </Box>
    </div>
  );
};

export default CheckoutSuccessPage;