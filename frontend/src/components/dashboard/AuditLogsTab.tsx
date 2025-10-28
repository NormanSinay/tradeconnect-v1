import React, { useState, useEffect } from 'react';
import { DashboardService, AuditLog } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLogsTabProps {
  activeTab: string;
}

const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ activeTab }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'auditoria') {
      loadAuditLogs();
    }
  }, [activeTab, currentPage, actionFilter, userFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        userId: userFilter !== 'all' ? userFilter : undefined
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

  const handleSearch = () => {
    setCurrentPage(1);
    loadAuditLogs();
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
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
              <TableHead>Descripción</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando logs de auditoría...
                </TableCell>
              </TableRow>
            ) : auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
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
    </div>
  );
};

export default AuditLogsTab;