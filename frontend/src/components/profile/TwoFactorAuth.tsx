/**
 * @fileoverview Componente de Autenticación de Dos Factores (2FA)
 * @description Gestión completa de autenticación de dos factores con QR codes y códigos de respaldo
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  QrCode,
  Download,
  CheckCircle,
  AlertTriangle,
  Copy,
  Smartphone,
  Key,
  Lock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/api';
import type { ApiResponse } from '@/types';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface TwoFactorStatus {
  enabled: boolean;
  qrCodeUrl?: string;
  secret?: string;
  backupCodes?: string[];
}

const TwoFactorAuth: React.FC = () => {
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const queryClient = useQueryClient();

  // Fetch 2FA status
  const {
    data: twoFactorStatus,
    isLoading,
    refetch,
  } = useQuery<TwoFactorStatus>({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const response: ApiResponse<TwoFactorStatus> = await authService.get2FAStatus();
      return response.data || { enabled: false };
    },
  });

  // Enable 2FA mutation
  const enableMutation = useMutation({
    mutationFn: async () => {
      const response: ApiResponse<{
        qrCodeUrl: string;
        secret: string;
        backupCodes: string[];
      }> = await authService.enable2FA();
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['2fa-status'], {
        enabled: false, // Not fully enabled until verified
        qrCodeUrl: data?.qrCodeUrl,
        secret: data?.secret,
        backupCodes: data?.backupCodes,
      });
      setVerifyModalOpen(true);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al habilitar 2FA'
      );
    },
  });

  // Verify 2FA mutation
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      return await authService.verify2FA(code);
    },
    onSuccess: () => {
      setShowBackupCodes(true);
      toast.success('2FA habilitado exitosamente');
      refetch();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Código de verificación inválido'
      );
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async (code: string) => {
      return await authService.disable2FA(code);
    },
    onSuccess: () => {
      setDisableModalOpen(false);
      setDisableCode('');
      toast.success('2FA deshabilitado');
      refetch();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al deshabilitar 2FA'
      );
    },
  });

  const handleToggle2FA = () => {
    if (twoFactorStatus?.enabled) {
      setDisableModalOpen(true);
    } else {
      enableMutation.mutate();
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    } else {
      toast.error('Ingresa un código de 6 dígitos');
    }
  };

  const handleDisable2FA = () => {
    if (disableCode.length === 6) {
      disableMutation.mutate(disableCode);
    } else {
      toast.error('Ingresa un código de 6 dígitos');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Código copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar código');
    }
  };

  const handleCopyAllBackupCodes = async () => {
    if (twoFactorStatus?.backupCodes) {
      const codesText = twoFactorStatus.backupCodes.join('\n');
      try {
        await navigator.clipboard.writeText(codesText);
        toast.success('Códigos copiados al portapapeles');
      } catch (error) {
        toast.error('Error al copiar códigos');
      }
    }
  };

  const handleDownloadBackupCodes = () => {
    if (twoFactorStatus?.backupCodes) {
      const codesText = twoFactorStatus.backupCodes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tradeconnect-backup-codes.txt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Códigos de respaldo descargados');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Skeleton className="h-8 w-8 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Autenticación de Dos Factores (2FA)</h2>
        <p className="text-muted-foreground">
          Añade una capa extra de seguridad a tu cuenta requiriendo un código de tu
          aplicación de autenticación además de tu contraseña.
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Shield
                className={cn(
                  "h-10 w-10",
                  twoFactorStatus?.enabled ? "text-green-600" : "text-muted-foreground"
                )}
              />
              <div>
                <h3 className="text-lg font-semibold">Estado de 2FA</h3>
                <Badge
                  variant={twoFactorStatus?.enabled ? "default" : "secondary"}
                  className={cn(
                    "mt-1",
                    twoFactorStatus?.enabled ? "bg-green-100 text-green-800" : ""
                  )}
                >
                  {twoFactorStatus?.enabled ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Habilitado
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Deshabilitado
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <Switch
              checked={twoFactorStatus?.enabled || false}
              onCheckedChange={handleToggle2FA}
              disabled={enableMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Information Alert */}
      {!twoFactorStatus?.enabled && (
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Recomendamos habilitar 2FA para proteger tu cuenta contra accesos no
            autorizados. Necesitarás una aplicación de autenticación como Google
            Authenticator o Authy.
          </AlertDescription>
        </Alert>
      )}

      {twoFactorStatus?.enabled && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Tu cuenta está protegida con autenticación de dos factores.
          </AlertDescription>
        </Alert>
      )}

      {/* How it Works */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">¿Cómo funciona?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">1. Instala una aplicación de autenticación</p>
                <p className="text-sm text-muted-foreground">Google Authenticator, Authy, o similar en tu dispositivo móvil</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <QrCode className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">2. Escanea el código QR</p>
                <p className="text-sm text-muted-foreground">La aplicación generará un código único de 6 dígitos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">3. Ingresa el código al iniciar sesión</p>
                <p className="text-sm text-muted-foreground">Se te pedirá el código cada vez que inicies sesión</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Codes */}
      {twoFactorStatus?.enabled && twoFactorStatus.backupCodes && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Códigos de Respaldo</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAllBackupCodes}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadBackupCodes}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>

            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Guarda estos códigos en un lugar seguro. Puedes usarlos para acceder a tu
                cuenta si pierdes acceso a tu aplicación de autenticación.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {twoFactorStatus.backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-md flex justify-between items-center font-mono text-sm"
                >
                  {code}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCode(code)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Modal */}
      <Dialog
        open={verifyModalOpen && !showBackupCodes}
        onOpenChange={(open) => !verifyMutation.isPending && setVerifyModalOpen(open)}
      >
        <DialogHeader>
          <DialogTitle>Configurar Autenticación de Dos Factores</DialogTitle>
        </DialogHeader>
        <DialogContent className="text-center py-4">
          <p className="mb-4">
            1. Escanea este código QR con tu aplicación de autenticación
          </p>

          {/* QR Code */}
          {twoFactorStatus?.qrCodeUrl ? (
            <img
              src={twoFactorStatus.qrCodeUrl}
              alt="QR Code"
              className="w-64 h-64 mx-auto my-4 border border-border rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 mx-auto my-4 flex items-center justify-center bg-muted rounded-lg">
              <QrCode className="w-32 h-32 text-muted-foreground" />
            </div>
          )}

          {/* Manual Entry */}
          {twoFactorStatus?.secret && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                O ingresa este código manualmente:
              </p>
              <div className="p-2 bg-muted rounded-md font-mono text-sm flex justify-between items-center">
                {twoFactorStatus.secret}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(twoFactorStatus.secret!)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <hr className="my-4" />

          <p className="mb-4">
            2. Ingresa el código de 6 dígitos generado por la aplicación
          </p>

          <div className="space-y-2">
            <Label htmlFor="verification-code">Código de Verificación</Label>
            <Input
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-xl tracking-widest"
              maxLength={6}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setVerifyModalOpen(false)}
            disabled={verifyMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || verifyMutation.isPending}
          >
            {verifyMutation.isPending && <Skeleton className="w-4 h-4 mr-2 rounded-full animate-spin" />}
            Verificar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Backup Codes Modal */}
      <Dialog
        open={showBackupCodes}
        onOpenChange={setShowBackupCodes}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            2FA Habilitado Exitosamente
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Guarda estos códigos de respaldo en un lugar
              seguro. Los necesitarás si pierdes acceso a tu aplicación de autenticación.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground mb-4">
            Códigos de Respaldo:
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {twoFactorStatus?.backupCodes?.map((code, index) => (
              <div
                key={index}
                className="p-3 bg-muted rounded-md font-mono text-sm text-center"
              >
                {code}
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleCopyAllBackupCodes}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Todos
          </Button>
          <Button variant="outline" onClick={handleDownloadBackupCodes}>
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
          <Button onClick={() => setShowBackupCodes(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Disable 2FA Modal */}
      <Dialog
        open={disableModalOpen}
        onOpenChange={(open) => !disableMutation.isPending && setDisableModalOpen(open)}
      >
        <DialogHeader>
          <DialogTitle>Deshabilitar 2FA</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deshabilitar 2FA hará tu cuenta menos segura.
            </AlertDescription>
          </Alert>
          <p className="text-sm mb-4">
            Ingresa el código de tu aplicación de autenticación para confirmar:
          </p>
          <div className="space-y-2">
            <Label htmlFor="disable-code">Código de Verificación</Label>
            <Input
              id="disable-code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-xl tracking-widest"
              maxLength={6}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDisableModalOpen(false)}
            disabled={disableMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisable2FA}
            disabled={disableCode.length !== 6 || disableMutation.isPending}
          >
            {disableMutation.isPending && <Skeleton className="w-4 h-4 mr-2 rounded-full animate-spin" />}
            Deshabilitar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default TwoFactorAuth;
