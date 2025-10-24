import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaBell, FaShieldAlt, FaEye, FaSave, FaKey, FaMobileAlt, FaEnvelope } from 'react-icons/fa';

interface NotificationSettings {
  emailNotifications: boolean;
  eventReminders: boolean;
  courseUpdates: boolean;
  promotional: boolean;
  newsletter: boolean;
}

interface PrivacySettings {
  profileVisible: boolean;
  showEmail: boolean;
  showCourses: boolean;
  showCertificates: boolean;
}

const UserSettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    eventReminders: true,
    courseUpdates: true,
    promotional: false,
    newsletter: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisible: true,
    showEmail: false,
    showCourses: true,
    showCertificates: true
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamadas reales a la API
      // const notificationsRes = await fetch('/api/v1/users/settings/notifications');
      // const privacyRes = await fetch('/api/v1/users/settings/privacy');
      // const securityRes = await fetch('/api/v1/users/settings/security');

      // Datos mock por ahora
      setTwoFactorEnabled(true);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePrivacyChange = (setting: keyof PrivacySettings, value: boolean) => {
    setPrivacy(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // TODO: Implementar llamada real a la API
      // await fetch('/api/v1/users/settings/notifications', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notifications)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Preferencias de notificación guardadas exitosamente');
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Error al guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      // TODO: Implementar llamada real a la API
      // await fetch('/api/v1/users/settings/privacy', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(privacy)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configuración de privacidad guardada exitosamente');
    } catch (error) {
      console.error('Error saving privacy:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setSaving(true);
      // TODO: Implementar llamada real a la API
      // await fetch('/api/v1/auth/password/change', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword,
      //     newPassword,
      //     confirmNewPassword: confirmPassword
      //   })
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setSaving(true);
      // TODO: Implementar llamada real a la API
      // await fetch(`/api/v1/auth/2fa/${twoFactorEnabled ? 'disable' : 'enable'}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ password: currentPassword })
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setTwoFactorEnabled(!twoFactorEnabled);
      alert(`2FA ${twoFactorEnabled ? 'deshabilitado' : 'habilitado'} exitosamente`);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      alert('Error al cambiar la configuración 2FA');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta página.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user?.name}</span>
              <Link to="/dashboard">
                <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="mt-2 text-gray-600">Gestiona tus preferencias y configuraciones de seguridad</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando configuración...</p>
            </div>
          ) : (
            <Tabs defaultValue="notifications" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="notifications">
                  <FaBell className="mr-2" />
                  Notificaciones
                </TabsTrigger>
                <TabsTrigger value="security">
                  <FaShieldAlt className="mr-2" />
                  Seguridad
                </TabsTrigger>
                <TabsTrigger value="privacy">
                  <FaEye className="mr-2" />
                  Privacidad
                </TabsTrigger>
              </TabsList>

              {/* Notificaciones */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FaBell className="mr-2" />
                      Preferencias de Notificación
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Selecciona cómo deseas recibir las notificaciones sobre tus eventos y cursos.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="email-notifications"
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked as boolean)}
                      />
                      <label htmlFor="email-notifications" className="text-sm font-medium">
                        Notificaciones por Email
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="event-reminders"
                        checked={notifications.eventReminders}
                        onCheckedChange={(checked) => handleNotificationChange('eventReminders', checked as boolean)}
                      />
                      <label htmlFor="event-reminders" className="text-sm font-medium">
                        Recordatorios de eventos
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="course-updates"
                        checked={notifications.courseUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('courseUpdates', checked as boolean)}
                      />
                      <label htmlFor="course-updates" className="text-sm font-medium">
                        Actualizaciones de cursos
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="promotional"
                        checked={notifications.promotional}
                        onCheckedChange={(checked) => handleNotificationChange('promotional', checked as boolean)}
                      />
                      <label htmlFor="promotional" className="text-sm font-medium">
                        Correos promocionales
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="newsletter"
                        checked={notifications.newsletter}
                        onCheckedChange={(checked) => handleNotificationChange('newsletter', checked as boolean)}
                      />
                      <label htmlFor="newsletter" className="text-sm font-medium">
                        Boletín informativo
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="bg-[#6B1E22] hover:bg-[#8a2b30]"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Guardar Preferencias
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Seguridad */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FaKey className="mr-2" />
                      Cambio de Contraseña
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Cambia tu contraseña para mantener tu cuenta segura.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y números
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleChangePassword}
                      disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                      className="bg-[#6B1E22] hover:bg-[#8a2b30]"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cambiando...
                        </>
                      ) : (
                        <>
                          <FaKey className="mr-2" />
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FaShieldAlt className="mr-2" />
                      Autenticación de Dos Factores
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Añade una capa extra de seguridad a tu cuenta.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {twoFactorEnabled ? <FaMobileAlt className="text-green-500" /> : <FaEnvelope className="text-gray-400" />}
                        <div>
                          <p className="font-medium">
                            2FA {twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {twoFactorEnabled
                              ? 'Tu cuenta está protegida con autenticación de dos factores'
                              : 'Habilita 2FA para mayor seguridad'
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleToggle2FA}
                        disabled={saving}
                        variant={twoFactorEnabled ? "destructive" : "default"}
                        className={twoFactorEnabled ? "" : "bg-[#6B1E22] hover:bg-[#8a2b30]"}
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          twoFactorEnabled ? 'Deshabilitar' : 'Habilitar'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacidad */}
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FaEye className="mr-2" />
                      Configuración de Privacidad
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Controla cómo otros usuarios ven tu información en la plataforma.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="profile-visible"
                        checked={privacy.profileVisible}
                        onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked as boolean)}
                      />
                      <label htmlFor="profile-visible" className="text-sm font-medium">
                        Perfil visible para otros usuarios
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="show-email"
                        checked={privacy.showEmail}
                        onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked as boolean)}
                      />
                      <label htmlFor="show-email" className="text-sm font-medium">
                        Mostrar email en perfil público
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="show-courses"
                        checked={privacy.showCourses}
                        onCheckedChange={(checked) => handlePrivacyChange('showCourses', checked as boolean)}
                      />
                      <label htmlFor="show-courses" className="text-sm font-medium">
                        Mostrar cursos completados
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="show-certificates"
                        checked={privacy.showCertificates}
                        onCheckedChange={(checked) => handlePrivacyChange('showCertificates', checked as boolean)}
                      />
                      <label htmlFor="show-certificates" className="text-sm font-medium">
                        Mostrar certificados obtenidos
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSavePrivacy}
                      disabled={saving}
                      className="bg-[#6B1E22] hover:bg-[#8a2b30]"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default UserSettingsPage;