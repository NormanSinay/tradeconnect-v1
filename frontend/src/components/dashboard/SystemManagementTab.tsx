import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemManagementTabProps {
  activeTab: string;
}

const SystemManagementTab: React.FC<SystemManagementTabProps> = ({ activeTab }) => {
  const [systemConfig, setSystemConfig] = useState({
    siteName: 'TradeConnect',
    siteDescription: 'Plataforma e-commerce para la gestión de eventos y cursos de la Cámara de Comercio de Guatemala.',
    currency: 'GTQ',
    timezone: 'America/Guatemala',
    language: 'es',
    maintenanceMode: false,
    userRegistration: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      loadSystemConfig();
    }
  }, [activeTab]);

  const loadSystemConfig = async () => {
    try {
      setLoading(true);
      const config = await DashboardService.getFullSystemConfig();
      console.log('System config loaded:', config);
      setSystemConfig({
        siteName: config?.general?.site_name || config?.general?.siteName || 'TradeConnect',
        siteDescription: config?.general?.site_description || config?.general?.siteDescription || 'Plataforma e-commerce para la gestión de eventos y cursos de la Cámara de Comercio de Guatemala.',
        currency: config?.general?.currency || 'GTQ',
        timezone: config?.general?.timezone || 'America/Guatemala',
        language: config?.general?.language || 'es',
        maintenanceMode: config?.general?.maintenance_mode || config?.general?.maintenanceMode || false,
        userRegistration: config?.general?.user_registration || config?.general?.userRegistration || true
      });
    } catch (error) {
      console.error('Error loading system config:', error);
      // Mantener valores por defecto
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);

      // Actualizar cada configuración por separado
      const updates = [
        { key: 'site_name', value: systemConfig.siteName, category: 'general' },
        { key: 'site_description', value: systemConfig.siteDescription, category: 'general' },
        { key: 'currency', value: systemConfig.currency, category: 'general' },
        { key: 'timezone', value: systemConfig.timezone, category: 'general' },
        { key: 'language', value: systemConfig.language, category: 'general' },
        { key: 'maintenance_mode', value: systemConfig.maintenanceMode, category: 'general' },
        { key: 'user_registration', value: systemConfig.userRegistration, category: 'general' }
      ];

      console.log('Updating system config with:', updates);

      // Actualizar cada configuración
      for (const update of updates) {
        try {
          await DashboardService.updateSystemConfigByKey(update.key, {
            value: update.value,
            isActive: true
          });
          console.log(`Updated config ${update.key}:`, update.value);
        } catch (updateError) {
          console.error(`Error updating ${update.key}:`, updateError);
          // Continuar con las demás actualizaciones
        }
      }

      toast.success('Configuración del sistema guardada exitosamente');
    } catch (error) {
      console.error('Error saving system config:', error);
      toast.error('Error al guardar la configuración del sistema');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (activeTab !== 'settings') return null;

  return (
    <div className="space-y-6">
      {/* Alerta de advertencia */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Advertencia:</strong> Los cambios en esta sección afectan a toda la plataforma.
          Proceda con precaución.
        </AlertDescription>
      </Alert>

      {/* Tabs de configuración */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button className="border-b-2 border-primary py-2 px-1 text-sm font-medium">
            General
          </button>
          <button className="py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-not-allowed opacity-50">
            Pasarelas de Pago
          </button>
          <button className="py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-not-allowed opacity-50">
            Configuración de Correo
          </button>
          <button className="py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-not-allowed opacity-50">
            Seguridad
          </button>
          <button className="py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-not-allowed opacity-50">
            Avanzada
          </button>
        </nav>
      </div>

      {/* Configuración General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración General del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Cargando configuración del sistema...
            </div>
          ) : (
            <>
              {/* Nombre del sitio */}
              <div className="space-y-2">
                <label htmlFor="siteName" className="text-sm font-medium">
                  Nombre del Sitio
                </label>
                <Input
                  id="siteName"
                  value={systemConfig.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  placeholder="Nombre del sitio"
                />
              </div>

              {/* Descripción del sitio */}
              <div className="space-y-2">
                <label htmlFor="siteDescription" className="text-sm font-medium">
                  Descripción del Sitio
                </label>
                <Textarea
                  id="siteDescription"
                  value={systemConfig.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  placeholder="Descripción del sitio"
                  rows={3}
                />
              </div>

              {/* Moneda y zona horaria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="currency" className="text-sm font-medium">
                    Moneda Principal
                  </label>
                  <Select
                    value={systemConfig.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTQ">Quetzal Guatemalteco (GTQ)</SelectItem>
                      <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="timezone" className="text-sm font-medium">
                    Zona Horaria
                  </label>
                  <Select
                    value={systemConfig.timezone}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Guatemala">Guatemala (UTC-6)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Idioma */}
              <div className="space-y-2">
                <label htmlFor="language" className="text-sm font-medium">
                  Idioma Principal
                </label>
                <Select
                  value={systemConfig.language}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opciones booleanas */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintenanceMode"
                    checked={systemConfig.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                  />
                  <label
                    htmlFor="maintenanceMode"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Modo Mantenimiento
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  El sitio no estará accesible para usuarios regulares
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="userRegistration"
                    checked={systemConfig.userRegistration}
                    onCheckedChange={(checked) => handleInputChange('userRegistration', checked)}
                  />
                  <label
                    htmlFor="userRegistration"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Permitir registro de nuevos usuarios
                  </label>
                </div>
              </div>

              {/* Botón guardar */}
              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="min-w-32"
                >
                  {saving ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemManagementTab;