import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Smartphone,
  AlertTriangle
} from 'lucide-react';

interface AttendanceRecord {
  id: number;
  eventTitle: string;
  eventDate: string;
  checkInTime: string;
  location: string;
  status: 'success' | 'failed' | 'pending';
  validatedAt: string;
}

const AttendanceValidationTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [manualCode, setManualCode] = useState('');

  // Mock data - será reemplazado con datos reales de la API
  const attendanceRecords: AttendanceRecord[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-11-15',
      checkInTime: '09:15',
      location: 'Centro de Convenciones - Sala A',
      status: 'success',
      validatedAt: '2024-11-15T09:15:00'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-10-20',
      checkInTime: '14:05',
      location: 'Online - Zoom Meeting',
      status: 'success',
      validatedAt: '2024-10-20T14:05:00'
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-09-10',
      checkInTime: '08:30',
      location: 'Hotel Marriott - Salón Principal',
      status: 'failed',
      validatedAt: '2024-09-10T08:30:00'
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Validado';
      case 'failed': return 'Fallido';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleScanQR = () => {
    setIsScanning(true);
    setScanResult(null);

    // Mock scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(Math.random() > 0.3 ? 'success' : 'error');
    }, 2000);
  };

  const handleManualValidation = () => {
    if (!manualCode.trim()) return;

    // Mock validation
    setTimeout(() => {
      setScanResult(Math.random() > 0.5 ? 'success' : 'error');
      setManualCode('');
    }, 1000);
  };

  const successfulValidations = attendanceRecords.filter(r => r.status === 'success').length;
  const totalValidations = attendanceRecords.length;

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <QrCode className="h-4 w-4" />
        <AlertDescription>
          <strong>Validación de Asistencia:</strong> Utiliza el escáner QR o ingresa manualmente
          el código para registrar tu asistencia en los eventos.
        </AlertDescription>
      </Alert>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Asistencias Validadas</p>
                <p className="text-2xl font-bold">{successfulValidations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Registros</p>
                <p className="text-2xl font-bold">{totalValidations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-[#607D8B]" />
              <div>
                <p className="text-sm text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold">
                  {totalValidations > 0 ? Math.round((successfulValidations / totalValidations) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escáner QR */}
      <Card>
        <CardHeader>
          <CardTitle>Escáner de Código QR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-64 h-64 mx-auto bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#607D8B] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Escaneando...</p>
                </div>
              ) : (
                <QrCode className="w-24 h-24 text-gray-400" />
              )}
            </div>

            {scanResult === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ¡Asistencia validada exitosamente! Bienvenido al evento.
                </AlertDescription>
              </Alert>
            )}

            {scanResult === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Error al validar asistencia. Verifica el código QR e intenta nuevamente.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleScanQR}
              disabled={isScanning}
              className="bg-[#607D8B] hover:bg-[#546E7A]"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isScanning ? 'Escaneando...' : 'Escanear Código QR'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validación Manual */}
      <Card>
        <CardHeader>
          <CardTitle>Validación Manual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ingresa el código de validación"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleManualValidation}
              disabled={!manualCode.trim()}
              className="bg-[#607D8B] hover:bg-[#546E7A]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validar
            </Button>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-800 text-sm">
              La validación manual debe usarse solo cuando el escáner QR no esté disponible.
              Asegúrate de tener el código correcto proporcionado por el organizador del evento.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Historial de Validaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.eventTitle}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.eventDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.checkInTime}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {getStatusText(record.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{record.location}</span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Validado el {formatDate(record.validatedAt)} a las {formatTime(record.validatedAt)}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consejos para validación */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Smartphone className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Consejos para una buena validación</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Asegúrate de que el código QR esté bien iluminado</li>
                <li>• Mantén el dispositivo estable mientras escaneas</li>
                <li>• Verifica que el código no esté dañado o sucio</li>
                <li>• Si hay problemas, solicita asistencia al organizador</li>
                <li>• La validación debe hacerse al inicio del evento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceValidationTab;