import React, { useState, useEffect } from 'react';
import { DashboardService, AuditLog } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Eye, Filter, BarChart3, Calendar, Users, Activity, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLogsTabProps {
  activeTab: string;
}

const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ activeTab }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTabView, setActiveTabView] = useState('logs');

  useEffect(() => {
    if (activeTab === 'auditoria') {
      loadAuditLogs();
      loadAuditStats();
    }
  }, [activeTab, currentPage, actionFilter, userFilter, resourceFilter, startDate, endDate]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        userId: userFilter !== 'all' ? userFilter : undefined,
        resource: resourceFilter !== 'all' ? resourceFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      const result = await DashboardService.getAuditLogs(params);
      setAuditLogs(result.auditLogs);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      setStatsLoading(true);
      const params: any = {
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const result = await DashboardService.getAuditStats(params);
      setAuditStats(result);
    } catch (error) {
      console.error('Error loading audit stats:', error);
      toast.error('Error al cargar estadísticas de auditoría');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAuditLogs();
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const params: any = {
        format,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        userId: userFilter !== 'all' ? userFilter : undefined,
        resource: resourceFilter !== 'all' ? resourceFilter : undefined
      };

      const blob = await DashboardService.exportAuditLogs(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Logs exportados exitosamente');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Error al exportar logs');
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await DashboardService.cleanupAuditLogs(90); // 90 días
      toast.success(`Se eliminaron ${result.deletedCount} logs antiguos`);
      loadAuditLogs();
      loadAuditStats();
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      toast.error('Error al limpiar logs antiguos');
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout': return 'default';
      case 'create':
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      case 'password_change': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const actionLabels: { [key: string]: string } = {
      login: 'Inicio de Sesión',
      logout: 'Cierre de Sesión',
      create: 'Creación',
      update: 'Actualización',
      delete: 'Eliminación',
      password_change: 'Cambio de Contraseña',
      profile_update: 'Actualización de Perfil',
      qr_generated: 'QR Generado',
      qr_used: 'QR Usado',
      payment_made: 'Pago Realizado'
    };
    return actionLabels[action] || action;
  };

  if (activeTab !== 'auditoria') return null;

  return (
    <div className="space-y-6">
      <Tabs value={activeTabView} onValueChange={setActiveTabView}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Logs de Auditoría</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          {/* Header con acciones */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="login">Inicio de Sesión</SelectItem>
                  <SelectItem value="logout">Cierre de Sesión</SelectItem>
                  <SelectItem value="create">Creación</SelectItem>
                  <SelectItem value="update">Actualización</SelectItem>
                  <SelectItem value="delete">Eliminación</SelectItem>
                  <SelectItem value="password_change">Cambio de Contraseña</SelectItem>
                  <SelectItem value="profile_update">Actualización de Perfil</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="admin_master">Admin User</SelectItem>
                  {/* Aquí se cargarían dinámicamente los usuarios */}
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por recurso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los recursos</SelectItem>
                  <SelectItem value="users">Usuarios</SelectItem>
                  <SelectItem value="events">Eventos</SelectItem>
                  <SelectItem value="payments">Pagos</SelectItem>
                  <SelectItem value="certificates">Certificados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleCleanup}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <span className="text-sm text-gray-500">a</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          {/* Tabla de logs de auditoría */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando logs de auditoría...
                    </TableCell>
                  </TableRow>
                ) : auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron logs de auditoría
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>{(log.metadata as any)?.resource || 'N/A'}</TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{log.location || 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {/* Estadísticas de auditoría */}
          {statsLoading ? (
            <div className="text-center py-8">Cargando estadísticas...</div>
          ) : auditStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditStats.totalLogs}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditStats.topUsers?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Acciones Diferentes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(auditStats.logsByAction || {}).length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recursos Auditados</CardTitle>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(auditStats.logsByResource || {}).length}</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">No se pudieron cargar las estadísticas</div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Información sobre Auditoría</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los logs de auditoría se mantienen por 2 años según la política de retención</li>
              <li>• Se registran todas las acciones críticas del sistema</li>
              <li>• Los datos incluyen información de ubicación aproximada basada en IP</li>
              <li>• Los administradores pueden acceder a logs detallados de cualquier usuario</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLogsTab;