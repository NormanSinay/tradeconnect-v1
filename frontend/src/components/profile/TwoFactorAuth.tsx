import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Alert,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Shield,
  QrCode,
  Download,
  CheckCircle,
  Warning,
  ContentCopy,
  PhoneIphone,
  VpnKey,
  Lock,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/api';
import type { ApiResponse } from '@/types';
import { toast } from 'react-hot-toast';

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
      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component={"div" as any}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Autenticación de Dos Factores (2FA)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Añade una capa extra de seguridad a tu cuenta requiriendo un código de tu
          aplicación de autenticación además de tu contraseña.
        </Typography>
      </Box>

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            component={"div" as any}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Shield
                sx={{
                  fontSize: 40,
                  color: twoFactorStatus?.enabled ? 'success.main' : 'text.disabled',
                }}
              />
              <Box component={"div" as any}>
                <Typography variant="h6" gutterBottom>
                  Estado de 2FA
                </Typography>
                <Chip
                  label={twoFactorStatus?.enabled ? 'Habilitado' : 'Deshabilitado'}
                  color={twoFactorStatus?.enabled ? 'success' : 'default'}
                  icon={
                    twoFactorStatus?.enabled ? <CheckCircle /> : <Lock />
                  }
                />
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={twoFactorStatus?.enabled || false}
                  onChange={handleToggle2FA}
                  disabled={enableMutation.isPending}
                />
              }
              label=""
            />
          </Box>
        </CardContent>
      </Card>

      {/* Information Alert */}
      {!twoFactorStatus?.enabled && (
        <Alert severity="info" icon={<Shield />} sx={{ mb: 3 }}>
          Recomendamos habilitar 2FA para proteger tu cuenta contra accesos no
          autorizados. Necesitarás una aplicación de autenticación como Google
          Authenticator o Authy.
        </Alert>
      )}

      {twoFactorStatus?.enabled && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          Tu cuenta está protegida con autenticación de dos factores.
        </Alert>
      )}

      {/* How it Works */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            ¿Cómo funciona?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <PhoneIphone color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Instala una aplicación de autenticación"
                secondary="Google Authenticator, Authy, o similar en tu dispositivo móvil"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <QrCode color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Escanea el código QR"
                secondary="La aplicación generará un código único de 6 dígitos"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VpnKey color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Ingresa el código al iniciar sesión"
                secondary="Se te pedirá el código cada vez que inicies sesión"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Backup Codes */}
      {twoFactorStatus?.enabled && twoFactorStatus.backupCodes && (
        <Card>
          <CardContent>
            <Box
              component={"div" as any}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Códigos de Respaldo
              </Typography>
              <Box component={"div" as any} sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={handleCopyAllBackupCodes}
                >
                  Copiar
                </Button>
                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={handleDownloadBackupCodes}
                >
                  Descargar
                </Button>
              </Box>
            </Box>

            <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
              Guarda estos códigos en un lugar seguro. Puedes usarlos para acceder a tu
              cuenta si pierdes acceso a tu aplicación de autenticación.
            </Alert>

            <Grid container spacing={1}>
              {twoFactorStatus.backupCodes.map((code, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Box
                    component={"div" as any}
                    sx={{
                      p: 1.5,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    }}
                  >
                    {code}
                    <Button
                      size="small"
                      onClick={() => handleCopyCode(code)}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <ContentCopy sx={{ fontSize: 16 }} />
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Setup Modal */}
      <Dialog
        open={verifyModalOpen && !showBackupCodes}
        onClose={() => !verifyMutation.isPending && setVerifyModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configurar Autenticación de Dos Factores</DialogTitle>
        <DialogContent>
          <Box component={"div" as any} sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              1. Escanea este código QR con tu aplicación de autenticación
            </Typography>

            {/* QR Code */}
            {twoFactorStatus?.qrCodeUrl ? (
              <Box
                component="img"
                src={twoFactorStatus.qrCodeUrl}
                alt="QR Code"
                sx={{
                  width: 250,
                  height: 250,
                  mx: 'auto',
                  my: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              />
            ) : (
              <Box
                component={"div" as any}
                sx={{
                  width: 250,
                  height: 250,
                  mx: 'auto',
                  my: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                }}
              >
                <QrCode sx={{ fontSize: 200, color: 'grey.400' }} />
              </Box>
            )}

            {/* Manual Entry */}
            {twoFactorStatus?.secret && (
              <Box component={"div" as any} sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  O ingresa este código manualmente:
                </Typography>
                <Box
                  component={"div" as any}
                  sx={{
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1,
                  }}
                >
                  {twoFactorStatus.secret}
                  <Button
                    size="small"
                    onClick={() => handleCopyCode(twoFactorStatus.secret!)}
                  >
                    <ContentCopy />
                  </Button>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" gutterBottom>
              2. Ingresa el código de 6 dígitos generado por la aplicación
            </Typography>

            <TextField
              fullWidth
              label="Código de Verificación"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' },
              }}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setVerifyModalOpen(false)}
            disabled={verifyMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || verifyMutation.isPending}
            startIcon={verifyMutation.isPending ? <CircularProgress size={20} /> : undefined}
          >
            Verificar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Codes Modal */}
      <Dialog
        open={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <CheckCircle sx={{ color: 'success.main', mr: 1, verticalAlign: 'middle' }} />
          2FA Habilitado Exitosamente
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
            <strong>Importante:</strong> Guarda estos códigos de respaldo en un lugar
            seguro. Los necesitarás si pierdes acceso a tu aplicación de autenticación.
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Códigos de Respaldo:
          </Typography>

          <Grid container spacing={1} sx={{ my: 2 }}>
            {twoFactorStatus?.backupCodes?.map((code, index) => (
              <Grid item xs={6} key={index}>
                <Box
                  component={"div" as any}
                  sx={{
                    p: 1.5,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  {code}
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<ContentCopy />} onClick={handleCopyAllBackupCodes}>
            Copiar Todos
          </Button>
          <Button startIcon={<Download />} onClick={handleDownloadBackupCodes}>
            Descargar
          </Button>
          <Button variant="contained" onClick={() => setShowBackupCodes(false)}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disable 2FA Modal */}
      <Dialog
        open={disableModalOpen}
        onClose={() => !disableMutation.isPending && setDisableModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Deshabilitar 2FA</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Deshabilitar 2FA hará tu cuenta menos segura.
          </Alert>
          <Typography variant="body2" gutterBottom>
            Ingresa el código de tu aplicación de autenticación para confirmar:
          </Typography>
          <TextField
            fullWidth
            label="Código de Verificación"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' },
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisableModalOpen(false)} disabled={disableMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDisable2FA}
            disabled={disableCode.length !== 6 || disableMutation.isPending}
            startIcon={disableMutation.isPending ? <CircularProgress size={20} /> : undefined}
          >
            Deshabilitar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TwoFactorAuth;
