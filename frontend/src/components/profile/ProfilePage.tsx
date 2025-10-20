import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { EventRegistration } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Download,
  QrCode,
  Receipt,
  GraduationCap,
  Settings
} from 'lucide-react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <div className="py-6">{children}</div>}
  </div>
);

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Mock data for user events and certificates
  const mockRegistrations = [
    {
      id: 1,
      eventId: 1,
      userId: user?.id || 1,
      participantType: 'individual' as const,
      quantity: 1,
      totalAmount: 150,
      paymentStatus: 'paid' as const,
      registrationStatus: 'confirmed' as const,
      registeredAt: '2024-01-15T10:00:00Z',
      participantData: [],
      event: {
        id: 1,
        title: 'Conferencia de Tecnología 2024',
        startDate: '2024-02-20T09:00:00Z',
        location: 'Centro de Convenciones, Guatemala',
        eventCategory: { id: 1, name: 'Tecnología', color: '#1976d2', isActive: true },
      },
    },
    {
      id: 2,
      eventId: 2,
      userId: user?.id || 1,
      participantType: 'individual' as const,
      quantity: 1,
      totalAmount: 200,
      paymentStatus: 'paid' as const,
      registrationStatus: 'confirmed' as const,
      registeredAt: '2024-01-10T14:30:00Z',
      participantData: [],
      event: {
        id: 2,
        title: 'Workshop de Marketing Digital',
        startDate: '2024-03-15T10:00:00Z',
        virtualLocation: 'Zoom Meeting',
        eventCategory: { id: 2, name: 'Marketing', color: '#2e7d32', isActive: true },
      },
    },
  ];

  const mockCertificates = [
    {
      id: 1,
      certificateNumber: 'CERT-2024-001',
      eventTitle: 'Conferencia de Tecnología 2024',
      issuedAt: '2024-02-20T17:00:00Z',
      status: 'issued',
    },
    {
      id: 2,
      certificateNumber: 'CERT-2024-002',
      eventTitle: 'Workshop de Marketing Digital',
      issuedAt: '2024-03-15T16:00:00Z',
      status: 'issued',
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setEditForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update API call
      // await updateProfile(editForm);
      setIsEditing(false);
      toast.success('Perfil actualizado exitosamente (simulado)');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleDownloadCertificate = (certificateId: number) => {
    // Mock download
    toast.success(`Descargando certificado ${certificateId}...`);
  };

  const handleDownloadQR = (registrationId: number) => {
    // Mock download
    toast.success(`Descargando QR para registro ${registrationId}...`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Acceso requerido
        </h1>
        <p className="text-muted-foreground">
          Debes iniciar sesión para acceder a tu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Mi Perfil
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y accede a tus eventos y certificados
        </p>
      </div>

      {/* Profile Header */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <Avatar className="w-32 h-32">
            <AvatarFallback className="text-3xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground mb-3">
              {user.email}
            </p>
            <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
              <Badge variant="outline">
                {user.roles?.includes('admin') ? 'Administrador' : user.roles?.includes('organizer') ? 'Organizador' : 'Usuario'}
              </Badge>
              <Badge variant={user.isActive ? 'default' : 'destructive'}>
                {user.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Miembro desde {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="0" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Mi Perfil
          </TabsTrigger>
          <TabsTrigger value="1" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Mis Eventos
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Mis Certificados
          </TabsTrigger>
          <TabsTrigger value="3" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Historial de Pagos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">
                Información Personal
              </h3>

              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  Actualiza tu información personal y preferencias
                </p>
                <Button
                  variant={isEditing ? 'outline' : 'default'}
                  onClick={handleEditToggle}
                >
                  {isEditing ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={isEditing ? editForm.firstName : user.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={isEditing ? editForm.lastName : user.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editForm.email : user.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={isEditing ? editForm.phone : user.phone || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSaveProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                  <Button variant="outline" onClick={handleEditToggle}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">
                Estadísticas
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {mockRegistrations.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Eventos
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {mockCertificates.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Certificados
                  </p>
                </Card>
              </div>

              <Alert className="mt-6">
                <AlertDescription>
                  <strong>💡 Tip:</strong> Mantén tu información actualizada para recibir
                  confirmaciones y recordatorios de eventos.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="1">
          <h3 className="text-xl font-semibold mb-4">
            Mis Eventos
          </h3>

          <Tabs value="upcoming" className="mb-6">
            <TabsList>
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="past">Pasados</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockRegistrations.map((registration) => (
              <Card key={registration.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold">
                      {registration.event?.title}
                    </h4>
                    <Badge variant={registration.registrationStatus === 'confirmed' ? 'default' : 'secondary'}>
                      {getStatusText(registration.registrationStatus)}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(registration.event?.startDate || '')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{registration.event?.location || registration.event?.virtualLocation || 'Ubicación por confirmar'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                      <span>Q{registration.totalAmount} • {registration.participantType === 'individual' ? 'Individual' : 'Empresa'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadQR(registration.id)}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      QR
                    </Button>
                    <Button size="sm" variant="outline">
                      Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="2">
          <h3 className="text-xl font-semibold mb-4">
            Mis Certificados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCertificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">
                        {certificate.eventTitle}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Certificado #{certificate.certificateNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Emitido: {formatDate(certificate.issuedAt)}
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => handleDownloadCertificate(certificate.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <QrCode className="mr-2 h-4 w-4" />
                      Ver QR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="outline" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Descargar Todos (ZIP)
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="3">
          <h3 className="text-xl font-semibold mb-4">
            Historial de Pagos
          </h3>

          <div className="space-y-4">
            {mockRegistrations.map((registration) => (
              <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{registration.event?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Fecha: {formatDate(registration.registeredAt)} • Monto: Q{registration.totalAmount} • Estado: {getStatusText(registration.paymentStatus)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;