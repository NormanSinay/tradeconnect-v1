/**
 * @fileoverview Página de Check-in de Operador
 * @description Gestión de asistencia y validación de QR codes para eventos
 *
 * Arquitectura Recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  QrCode,
  CheckCircle,
  X,
  User,
  Calendar,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const OperatorCheckinPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Mock data - Replace with actual API call
  const currentEvent = {
    id: 1,
    title: 'Transformación Digital en Empresas 2024',
    date: '2024-03-15',
    time: '14:00',
    location: 'Auditorio Principal',
    totalRegistrations: 150,
    checkedIn: 87,
  };

  const recentCheckIns = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      ticketNumber: 'TC-2024-001',
      time: '13:45',
      status: 'success',
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria.gonzalez@example.com',
      ticketNumber: 'TC-2024-002',
      time: '13:42',
      status: 'success',
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos.lopez@example.com',
      ticketNumber: 'TC-2024-003',
      time: '13:40',
      status: 'duplicate',
    },
  ];

  const handleScanQR = () => {
    // Simulate QR scan - Replace with actual QR scanner integration
    setTimeout(() => {
      const mockScan = {
        name: 'Pedro Ramírez',
        email: 'pedro.ramirez@example.com',
        ticketNumber: 'TC-2024-125',
        registrationType: 'VIP',
        valid: true,
      };
      setScanResult(mockScan);
      setScanStatus('success');
    }, 1000);
  };

  const handleManualEntry = () => {
    if (!manualCode.trim()) {
      setScanStatus('error');
      return;
    }

    // Simulate manual code validation
    const mockResult = {
      name: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      ticketNumber: manualCode,
      registrationType: 'General',
      valid: true,
    };
    setScanResult(mockResult);
    setScanStatus('success');
    setManualCode('');
  };

  const handleConfirmCheckIn = () => {
    // TODO: Send check-in to backend
    console.log('Check-in confirmed for:', scanResult);
    setScanResult(null);
    setScanStatus('idle');
  };

  const handleCancelCheckIn = () => {
    setScanResult(null);
    setScanStatus('idle');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'duplicate':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'duplicate':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Check-in de Asistentes</h1>
        <p className="text-muted-foreground">
          Validación de QR y registro de asistencia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Scanner & Manual Entry */}
        <div className="space-y-6">
          {/* Event Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Evento Actual</h2>
            <h3 className="text-2xl font-bold mb-3">{currentEvent.title}</h3>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentEvent.time}
              </Badge>
              <Badge variant="outline">{currentEvent.location}</Badge>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between">
              <span className="text-sm">Progreso de Check-in:</span>
              <span className="text-sm font-bold">
                {currentEvent.checkedIn} / {currentEvent.totalRegistrations} (
                {Math.round((currentEvent.checkedIn / currentEvent.totalRegistrations) * 100)}%)
              </span>
            </div>
          </Card>

          {/* QR Scanner */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Escanear Código QR</h2>
            <div className="flex flex-col items-center gap-4 py-8 bg-muted rounded-lg mb-4">
              <QrCode className="w-24 h-24 text-primary" />
              <Button
                size="lg"
                onClick={handleScanQR}
              >
                <QrCode className="w-5 h-5 mr-2" />
                Iniciar Escaneo
              </Button>
            </div>
          </Card>

          {/* Manual Entry */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Entrada Manual</h2>
            <p className="text-muted-foreground mb-4">
              Ingresa el código del ticket manualmente si el QR no funciona
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: TC-2024-001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualEntry()}
                className="flex-1"
              />
              <Button onClick={handleManualEntry}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Scan Result & Recent Check-ins */}
        <div className="space-y-6">
          {/* Scan Result */}
          {scanResult && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resultado del Escaneo</h2>

              {scanStatus === 'success' && (
                <>
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Código QR válido - Listo para check-in
                    </AlertDescription>
                  </Alert>

                  <Card className="mb-6 bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16 bg-green-600">
                          <User className="w-8 h-8" />
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{scanResult.name}</h3>
                          <p className="text-muted-foreground">{scanResult.email}</p>
                        </div>
                      </div>
                      <hr className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Número de Ticket</p>
                          <p className="font-medium">{scanResult.ticketNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tipo de Registro</p>
                          <p className="font-medium">{scanResult.registrationType}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={handleConfirmCheckIn}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmar Check-in
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelCheckIn}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}

              {scanStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Código inválido o ya utilizado. Verifica los datos.
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          )}

          {/* Recent Check-ins */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Check-ins Recientes</h2>
              <Button size="sm" variant="ghost">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {recentCheckIns.map((checkin, index) => (
                <div key={checkin.id} className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 bg-primary flex-shrink-0">
                    {getStatusIcon(checkin.status)}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium truncate">{checkin.name}</h3>
                      <Badge
                        variant={checkin.status === 'success' ? 'default' : 'destructive'}
                        className={cn(
                          checkin.status === 'success' ? 'bg-green-100 text-green-800' : ''
                        )}
                      >
                        {checkin.status === 'success' ? 'Confirmado' : 'Duplicado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{checkin.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {checkin.ticketNumber} • {checkin.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OperatorCheckinPage;
