import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  Building2,
  MapPin,
  Wallet,
  Shield,
  Lock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import type { CheckoutForm } from '@/types';
import { cn } from '@/lib/utils';

const steps = ['Información Personal', 'Método de Pago', 'Confirmación'];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nit: '',
    cui: '',
    billingName: '',
    billingAddress: '',
    paymentMethod: 'card',
    acceptTerms: false,
    newsletter: false,
  });

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CheckoutForm> = {};

    if (step === 0) {
      // Personal Information validation
      if (!formData.firstName.trim()) newErrors.firstName = 'Nombre requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'Apellido requerido';
      if (!formData.email.trim()) newErrors.email = 'Email requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
      if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Debe aceptar los términos y condiciones' as any;

      // FEL validation (at least NIT or CUI)
      if (!formData.nit?.trim() && !formData.cui?.trim()) {
        newErrors.nit = 'Debe ingresar NIT o CUI';
        newErrors.cui = 'Debe ingresar NIT o CUI';
      }
    }

    if (step === 1) {
      // Payment method validation
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Método de pago requerido' as any;

      if (formData.paymentMethod === 'card') {
        // Card validation would go here
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field: keyof CheckoutForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Clear cart after successful payment
      await clearCart();

      toast.success('¡Pago procesado exitosamente!');
      navigate('/checkout/success');
    } catch (error) {
      toast.error('Error al procesar el pago. Intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => `Q${price.toFixed(2)}`;

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Carrito vacío
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          No hay productos en tu carrito para procesar.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/events')}>
          Ver Eventos
        </Button>
      </Container>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box component={"div" as any} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Información Personal
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              🧾 Información de Facturación FEL (Guatemala)
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Para emitir facturas electrónicas válidas en Guatemala, necesitamos su información tributaria.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NIT"
                  value={formData.nit}
                  onChange={(e) => handleInputChange('nit', e.target.value)}
                  error={!!errors.nit}
                  helperText={errors.nit || 'Ej: 12345678-9'}
                  placeholder="12345678-9"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CUI (DPI)"
                  value={formData.cui}
                  onChange={(e) => handleInputChange('cui', e.target.value)}
                  error={!!errors.cui}
                  helperText={errors.cui || 'Para consumidor final'}
                  placeholder="1234567890123"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Fiscal"
                  value={formData.billingName}
                  onChange={(e) => handleInputChange('billingName', e.target.value)}
                  helperText="Se autocompletará si el NIT es válido"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección Fiscal"
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <FormControlLabel
              control={
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  style={{ marginRight: 8 }}
                />
              }
              label={
                <Typography variant="body2">
                  Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'primary.main' }}>términos y condiciones</a> y la <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'primary.main' }}>política de privacidad</a>
                </Typography>
              }
            />
            {errors.acceptTerms && (
              <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4 }}>
                {errors.acceptTerms}
              </Typography>
            )}

            <FormControlLabel
              control={
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                  style={{ marginRight: 8 }}
                />
              }
              label="Deseo recibir información sobre nuevos eventos y promociones"
            />
          </Box>
        );

      case 1:
        return (
          <Box component={"div" as any} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Método de Pago
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                Seleccione su método de pago:
              </FormLabel>
              <RadioGroup
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
              >
                <Paper sx={{ p: 2, mb: 2, border: '2px solid', borderColor: formData.paymentMethod === 'card' ? 'primary.main' : 'grey.300' }}>
                  <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label={
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CreditCard color="primary" />
                        <Box component={"div" as any}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Tarjeta de Crédito/Débito
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Visa, MasterCard, American Express
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>

                <Paper sx={{ p: 2, mb: 2, border: '2px solid', borderColor: formData.paymentMethod === 'paypal' ? 'primary.main' : 'grey.300' }}>
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label={
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Payment color="primary" />
                        <Box component={"div" as any}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            PayPal
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Pago seguro con PayPal
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>

                <Paper sx={{ p: 2, border: '2px solid', borderColor: formData.paymentMethod === 'bank_transfer' ? 'primary.main' : 'grey.300' }}>
                  <FormControlLabel
                    value="bank_transfer"
                    control={<Radio />}
                    label={
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Business color="primary" />
                        <Box component={"div" as any}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Transferencia Bancaria
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            NeoNet, BAM, Transferencia directa
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>

            {formData.paymentMethod === 'card' && (
              <Box component={"div" as any} sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Información de Tarjeta
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Número de Tarjeta"
                      placeholder="1234 5678 9012 3456"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCard />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Expiración"
                      placeholder="MM/AA"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      type="password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Security />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre del Titular"
                      placeholder="Como aparece en la tarjeta"
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }} icon={<Lock />}>
                  <Typography variant="body2">
                    <strong>🔒 Pago Seguro:</strong> Sus datos están protegidos con encriptación SSL de 256 bits.
                    No almacenamos información de su tarjeta.
                  </Typography>
                </Alert>
              </Box>
            )}

            {formData.paymentMethod === 'paypal' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Será redirigido a PayPal para completar su pago de forma segura.
                </Typography>
              </Alert>
            )}

            {formData.paymentMethod === 'bank_transfer' && (
              <Box component={"div" as any} sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Información de Transferencia
                </Typography>
                <Alert severity="warning">
                  <Typography variant="body2">
                    Las instrucciones de pago serán enviadas a su email después de confirmar la orden.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box component={"div" as any} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Confirmación de Orden
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
              <Typography variant="body2">
                <strong>¡Listo para procesar!</strong> Revise su información y confirme el pago.
              </Typography>
            </Alert>

            {/* Order Summary */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Resumen de la Orden
              </Typography>

              {cart.items.map((item) => (
                <Box key={item.id} component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {item.event?.title} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">{formatPrice(item.total)}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">{formatPrice(cart.subtotal)}</Typography>
              </Box>

              {cart.discountAmount > 0 && (
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                  <Typography variant="body2">Descuento:</Typography>
                  <Typography variant="body2">-{formatPrice(cart.discountAmount)}</Typography>
                </Box>
              )}

              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <Typography variant="body1">Total:</Typography>
                <Typography variant="body1">{formatPrice(cart.total)}</Typography>
              </Box>
            </Paper>

            {/* Customer Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Información del Cliente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Nombre:</Typography>
                  <Typography variant="body1">{formData.firstName} {formData.lastName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                  <Typography variant="body1">{formData.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Método de Pago:</Typography>
                  <Typography variant="body1">
                    {formData.paymentMethod === 'card' ? 'Tarjeta de Crédito' :
                     formData.paymentMethod === 'paypal' ? 'PayPal' : 'Transferencia Bancaria'}
                  </Typography>
                </Grid>
                {(formData.nit || formData.cui) && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Información FEL:</Typography>
                    <Typography variant="body1">
                      {formData.nit && `NIT: ${formData.nit}`}
                      {formData.nit && formData.cui && ' | '}
                      {formData.cui && `CUI: ${formData.cui}`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            <Alert severity="info">
              <Typography variant="body2">
                Al confirmar, acepta procesar el pago y recibir la confirmación por email.
                La factura FEL será enviada automáticamente después del pago.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Checkout
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete su información para procesar el pago
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Paper>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Resumen del Pedido
            </Typography>

            <Box component={"div" as any} sx={{ mb: 3 }}>
              {cart.items.map((item) => (
                <Box key={item.id} component={"div" as any} sx={{ display: 'flex', mb: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 60, height: 60, borderRadius: 1, mr: 2, objectFit: 'cover' }}
                    image={item.event?.media?.find(m => m.isPrimary)?.filePath || '/placeholder-event.jpg'}
                    alt={item.event?.title}
                  />
                  <Box component={"div" as any} sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {item.event?.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cantidad: {item.quantity} | {formatPrice(item.finalPrice)} c/u
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(item.total)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box component={"div" as any} sx={{ mb: 2 }}>
              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">{formatPrice(cart.subtotal)}</Typography>
              </Box>

              {cart.discountAmount > 0 && (
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                  <Typography variant="body2">Descuento:</Typography>
                  <Typography variant="body2">-{formatPrice(cart.discountAmount)}</Typography>
                </Box>
              )}

              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <Typography variant="body1">Total a Pagar:</Typography>
                <Typography variant="body1" color="primary.main">
                  {formatPrice(cart.total)}
                </Typography>
              </Box>
            </Box>

            <Alert severity="success" icon={<Security />}>
              <Typography variant="caption">
                Pago seguro garantizado con encriptación SSL
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/cart')}
          startIcon={<ArrowBack />}
        >
          Volver al Carrito
        </Button>

        <Box component={"div" as any} sx={{ display: 'flex', gap: 2 }}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isProcessing}
            >
              Anterior
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              disabled={isProcessing}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{ minWidth: 150 }}
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default CheckoutPage;