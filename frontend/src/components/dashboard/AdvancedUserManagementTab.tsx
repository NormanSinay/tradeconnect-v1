import React, { useState, useEffect, useCallback } from 'react';
import { DashboardService, User } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  History,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertTriangle,
  Users,
  UserCog,
  Settings,
  Key,
  Activity,
  FileText,
  BarChart3,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Lock,
  Unlock,
  Crown,
  Star,
  Award,
  Target,
  TrendingUp,
  Database,
  Import
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdvancedUserManagementTabProps {
  activeTab: string;
}

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

interface AuditLog {
  id: number;
  userId: string;
  action: string;
  description: string;
  ipAddress: string;
  location?: string;
  metadata?: any;
  createdAt: string;
}

interface UserGroup {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  category?: string;
}

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  level: number;
  color?: string;
  icon?: string;
  userCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface UserSession {
  id: number;
  userId: number;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceType?: string;
  deviceOS?: string;
  deviceBrowser?: string;
  locationCountry?: string;
  locationCity?: string;
  locationRegion?: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActivity: string;
  expiresAt: string;
  refreshToken?: string;
  refreshTokenExpires?: string;
  loginMethod?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

const AdvancedUserManagementTab: React.FC<AdvancedUserManagementTabProps> = ({ activeTab }) => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  // Estados principales
  const [activeUserTab, setActiveUserTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [userAudit, setUserAudit] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});

  // Estados del formulario
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    isActive: true,
    emailVerified: false,
    twoFactorEnabled: false
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  // Estados para roles y permisos
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

  // Estados para grupos
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [groupUsers, setGroupUsers] = useState<User[]>([]);

  // Estados para importación/exportación
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'usuarios') {
      switch (activeUserTab) {
        case 'users':
          loadUsers();
          break;
        case 'roles':
          loadRoles();
          break;
        case 'groups':
          loadUserGroups();
          break;
        case 'sessions':
          loadUserSessions();
          break;
      }
    }
  }, [activeTab, activeUserTab, currentPage, roleFilter, statusFilter, groupFilter]);

  // Funciones de carga de datos
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        const params: any = {
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          isActive: statusFilter !== 'all' ? statusFilter === 'true' : undefined,
          groupId: groupFilter !== 'all' ? groupFilter : undefined
        };

        const result = await DashboardService.getUsers(params);
        setUsers(result.users);
        setTotalPages(result.pagination.totalPages);
      }, 'Error al cargar usuarios');

      await loadData();
    } catch (error) {
      console.error('Error in loadUsers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, groupFilter, searchTerm, withErrorHandling]);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        const result = await DashboardService.getRoles();
        setRoles(result.roles);
      }, 'Error al cargar roles');

      await loadData();
    } catch (error) {
      console.error('Error in loadRoles:', error);
    } finally {
      setLoading(false);
    }
  }, [withErrorHandling]);

  const loadUserGroups = useCallback(async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        const result = await DashboardService.getUserGroups();
        setUserGroups(result.groups);
      }, 'Error al cargar grupos de usuarios');

      await loadData();
    } catch (error) {
      console.error('Error in loadUserGroups:', error);
    } finally {
      setLoading(false);
    }
  }, [withErrorHandling]);

  const loadUserSessions = useCallback(async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        const result = await DashboardService.getUserSessions();
        setUserSessions(result.sessions);
      }, 'Error al cargar sesiones de usuarios');

      await loadData();
    } catch (error) {
      console.error('Error in loadUserSessions:', error);
    } finally {
      setLoading(false);
    }
  }, [withErrorHandling]);

  const loadUserAudit = async (userId: number) => {
    try {
      setLoadingAudit(true);
      const loadAudit = withErrorHandling(async () => {
        const result = await DashboardService.getUserAudit(userId);
        setUserAudit(result.logs || []);
      }, 'Error al cargar auditoría del usuario');

      await loadAudit();
    } catch (error) {
      console.error('Error in loadUserAudit:', error);
      setUserAudit([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const loadUserRegistrations = async (userId: number) => {
    try {
      const loadRegs = withErrorHandling(async () => {
        const result = await DashboardService.getUserRegistrations(userId);
        setUserRegistrations(result.registrations);
        setUserStats({
          totalEvents: result.registrations.length,
          activeEvents: result.registrations.filter(r => r.status === 'confirmed').length,
          totalRegistrations: result.registrations.length,
          totalRevenue: result.registrations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0)
        });
      }, 'Error al cargar inscripciones del usuario');

      await loadRegs();
    } catch (error) {
      console.error('Error in loadUserRegistrations:', error);
      setUserRegistrations([]);
      setUserStats({ totalEvents: 0, activeEvents: 0, totalRegistrations: 0, totalRevenue: 0 });
    }
  };

  // Funciones de gestión de usuarios
  const handleUserStatusChange = async (userId: number, isActive: boolean) => {
    try {
      const updateData = withErrorHandling(async () => {
        await DashboardService.updateUserStatus(userId, isActive);
      }, `Error al ${isActive ? 'activar' : 'desactivar'} usuario`);

      await updateData();
      toast.success(`Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`);
      loadUsers();
    } catch (error) {
      console.error('Error in handleUserStatusChange:', error);
    }
  };

  const handleBulkAction = async (action: string, userIds: number[]) => {
    try {
      const bulkData = withErrorHandling(async () => {
        await DashboardService.bulkUserAction(action, userIds);
      }, `Error al ejecutar acción masiva: ${action}`);

      await bulkData();
      toast.success(`Acción masiva ejecutada exitosamente`);
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error in handleBulkAction:', error);
    }
  };

  const handleExportUsers = async (format: 'csv' | 'excel' | 'json' = 'csv') => {
    try {
      const exportData = withErrorHandling(async () => {
        const result = await DashboardService.exportUsers({
          format,
          filters: {
            role: roleFilter !== 'all' ? roleFilter : undefined,
            isActive: statusFilter !== 'all' ? statusFilter === 'true' : undefined,
            groupId: groupFilter !== 'all' ? groupFilter : undefined
          }
        });

        // Crear y descargar archivo
        const blob = new Blob([result.data], {
          type: format === 'csv' ? 'text/csv' :
                format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      }, 'Error al exportar usuarios');

      await exportData();
      toast.success('Usuarios exportados exitosamente');
    } catch (error) {
      console.error('Error in handleExportUsers:', error);
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      toast.error('Selecciona un archivo para importar');
      return;
    }

    try {
      setSubmitting(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', importFile);

      const importData = withErrorHandling(async () => {
        const result = await DashboardService.importUsers(formDataUpload, (progress) => {
          setImportProgress(progress);
        });
        setImportResults(result);
      }, 'Error al importar usuarios');

      await importData();
      toast.success('Usuarios importados exitosamente');
      setShowImportModal(false);
      setImportFile(null);
      setImportProgress(0);
      loadUsers();
    } catch (error) {
      console.error('Error in handleImportUsers:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Funciones de gestión de roles
  const handleCreateRole = async () => {
    try {
      const roleData = withErrorHandling(async () => {
        await DashboardService.createRole({
          name: formData.firstName, // Reutilizando campos del formulario
          description: formData.lastName,
          permissions: rolePermissions.map(p => p.id)
        });
      }, 'Error al crear rol');

      await roleData();
      toast.success('Rol creado exitosamente');
      setShowRoleModal(false);
      loadRoles();
    } catch (error) {
      console.error('Error in handleCreateRole:', error);
    }
  };

  const handleUpdateRolePermissions = async (roleId: number, permissions: number[]) => {
    try {
      const updateData = withErrorHandling(async () => {
        await DashboardService.updateRolePermissions(roleId, permissions);
      }, 'Error al actualizar permisos del rol');

      await updateData();
      toast.success('Permisos del rol actualizados exitosamente');
      loadRoles();
    } catch (error) {
      console.error('Error in handleUpdateRolePermissions:', error);
    }
  };

  // Funciones de gestión de grupos
  const handleCreateGroup = async () => {
    try {
      const groupData = withErrorHandling(async () => {
        await DashboardService.createUserGroup({
          name: formData.firstName,
          description: formData.lastName
        });
      }, 'Error al crear grupo');

      await groupData();
      toast.success('Grupo creado exitosamente');
      setShowGroupModal(false);
      loadUserGroups();
    } catch (error) {
      console.error('Error in handleCreateGroup:', error);
    }
  };

  // Funciones de validación y formularios
  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!formData.email) errors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';

    if (!showEditModal) {
      if (!formData.password) errors.password = 'Contraseña es requerida';
      else if (formData.password.length < 8) errors.password = 'Contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.firstName) errors.firstName = 'Nombre es requerido';
    else if (formData.firstName.length < 2) errors.firstName = 'Nombre debe tener al menos 2 caracteres';

    if (!formData.lastName) errors.lastName = 'Apellido es requerido';
    else if (formData.lastName.length < 2) errors.lastName = 'Apellido debe tener al menos 2 caracteres';

    if (formData.phone && !/^\+502\s?\d{4}-?\d{4}$/.test(formData.phone)) {
      errors.phone = 'Teléfono debe tener formato +502 XXXX-XXXX';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      isActive: true,
      emailVerified: false,
      twoFactorEnabled: false
    });
    setFormErrors({});
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const createData = withErrorHandling(async () => {
        await DashboardService.createUser(formData);
        toast.success('Usuario creado exitosamente');
      }, 'Error al crear usuario');

      await createData();
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error in handleCreateUser:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !validateForm()) return;

    try {
      setSubmitting(true);
      const updateData = withErrorHandling(async () => {
        const updatePayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          isActive: formData.isActive,
          emailVerified: formData.emailVerified,
          twoFactorEnabled: formData.twoFactorEnabled
        };
        await DashboardService.updateUser(selectedUser.id, updatePayload);
        toast.success('Usuario actualizado exitosamente');
      }, 'Error al actualizar usuario');

      await updateData();
      setShowEditModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error in handleEditUser:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    loadUserAudit(user.id);
    loadUserRegistrations(user.id);
  };

  const handleEditUserClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.isEmailVerified || false,
      twoFactorEnabled: user.is2faEnabled || false
    });
    setShowEditModal(true);
  };

  const handleDeleteUserClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const deleteData = withErrorHandling(async () => {
        await DashboardService.deleteUser(selectedUser.id);
      }, 'Error al eliminar usuario');

      await deleteData();
      toast.success('Usuario eliminado exitosamente');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error in handleDeleteUserConfirm:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Funciones auxiliares
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'secondary';
      case 'manager': return 'default';
      case 'organizer': return 'outline';
      case 'speaker': return 'outline';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'destructive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-GT');
  };

  if (activeTab !== 'usuarios') return null;

  return (
    <div className="space-y-6">
      {/* Verificación de permisos */}
      {!permissions.canManageUsers && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para gestionar usuarios avanzadamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Header con acciones principales */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="organizer">Organizador</SelectItem>
              <SelectItem value="speaker">Speaker</SelectItem>
              <SelectItem value="participant">Participante</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="true">Activo</SelectItem>
              <SelectItem value="false">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => handleExportUsers('csv')}>
            <Upload className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Usuarios</DialogTitle>
                <DialogDescription>
                  Selecciona un archivo CSV o Excel para importar usuarios masivamente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Archivo</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                </div>
                {importProgress > 0 && (
                  <div>
                    <Label>Progreso de Importación</Label>
                    <Progress value={importProgress} className="mt-2" />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImportUsers} disabled={submitting || !importFile}>
                    {submitting ? 'Importando...' : 'Importar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {permissions.canManageUsers && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Complete la información requerida para crear un nuevo usuario en el sistema.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={formErrors.email ? 'border-red-500' : ''}
                      />
                      {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={formErrors.password ? 'border-red-500' : ''}
                      />
                      {formErrors.password && <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nombre *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className={formErrors.firstName ? 'border-red-500' : ''}
                        />
                        {formErrors.firstName && <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Apellido *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className={formErrors.lastName ? 'border-red-500' : ''}
                        />
                        {formErrors.lastName && <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        placeholder="+502 1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={formErrors.phone ? 'border-red-500' : ''}
                      />
                      {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="role">Rol</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="speaker">Speaker</SelectItem>
                          <SelectItem value="participant">Participante</SelectItem>
                          <SelectItem value="organizer">Organizador</SelectItem>
                          {permissions.canManageSystem && (
                            <>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                      />
                      <Label htmlFor="isActive">Usuario activo</Label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Creando...' : 'Crear Usuario'}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Pestañas principales */}
      <Tabs value={activeUserTab} onValueChange={setActiveUserTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Grupos
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sesiones
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tab de Usuarios */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Acciones masivas */}
              {selectedUsers.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('activate', selectedUsers)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Activar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction('deactivate', selectedUsers)}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Desactivar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowBulkActionsModal(true)}
                      >
                        <MoreHorizontal className="w-4 h-4 mr-1" />
                        Más acciones
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla de usuarios */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers(users.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Cargando usuarios...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.email.split('@')[0]}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role === 'super_admin' ? 'Super Admin' :
                               user.role === 'admin' ? 'Admin' :
                               user.role === 'manager' ? 'Manager' :
                               user.role === 'organizer' ? 'Organizador' :
                               user.role === 'speaker' ? 'Speaker' :
                               user.role === 'participant' ? 'Participante' : 'Usuario'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(user.isActive)}>
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {permissions.canManageUsers && (
                                <Dialog open={showEditModal && selectedUser?.id === user.id} onOpenChange={(open: boolean) => {
                                  if (!open) setShowEditModal(false);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditUserClick(user)}
                                      title="Editar usuario"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Editar Usuario</DialogTitle>
                                      <DialogDescription>
                                        Modifique la información del usuario seleccionado.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-email">Email</Label>
                                        <Input
                                          id="edit-email"
                                          type="email"
                                          value={formData.email}
                                          disabled
                                          className="bg-gray-50"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="edit-firstName">Nombre *</Label>
                                          <Input
                                            id="edit-firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className={formErrors.firstName ? 'border-red-500' : ''}
                                          />
                                          {formErrors.firstName && <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>}
                                        </div>
                                        <div>
                                          <Label htmlFor="edit-lastName">Apellido *</Label>
                                          <Input
                                            id="edit-lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className={formErrors.lastName ? 'border-red-500' : ''}
                                          />
                                          {formErrors.lastName && <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>}
                                        </div>
                                      </div>
                                      <div>
                                        <Label htmlFor="edit-phone">Teléfono</Label>
                                        <Input
                                          id="edit-phone"
                                          placeholder="+502 1234-5678"
                                          value={formData.phone}
                                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                          className={formErrors.phone ? 'border-red-500' : ''}
                                        />
                                        {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
                                      </div>
                                      {permissions.canManageSystem && (
                                        <div>
                                          <Label htmlFor="edit-role">Rol</Label>
                                          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="user">Usuario</SelectItem>
                                              <SelectItem value="speaker">Speaker</SelectItem>
                                              <SelectItem value="participant">Participante</SelectItem>
                                              <SelectItem value="organizer">Organizador</SelectItem>
                                              <SelectItem value="manager">Manager</SelectItem>
                                              <SelectItem value="admin">Admin</SelectItem>
                                              <SelectItem value="super_admin">Super Admin</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id="edit-isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                                          />
                                          <Label htmlFor="edit-isActive">Usuario activo</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id="edit-emailVerified"
                                            checked={formData.emailVerified}
                                            onCheckedChange={(checked) => setFormData({ ...formData, emailVerified: checked as boolean })}
                                          />
                                          <Label htmlFor="edit-emailVerified">Email verificado</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id="edit-twoFactorEnabled"
                                            checked={formData.twoFactorEnabled}
                                            onCheckedChange={(checked) => setFormData({ ...formData, twoFactorEnabled: checked as boolean })}
                                          />
                                          <Label htmlFor="edit-twoFactorEnabled">2FA habilitado</Label>
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                                          Cancelar
                                        </Button>
                                        <Button onClick={handleEditUser} disabled={submitting}>
                                          {submitting ? 'Actualizando...' : 'Actualizar Usuario'}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              {permissions.canManageUsers && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUserStatusChange(user.id, !user.isActive)}
                                  title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                >
                                  {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                              )}
                              {permissions.canDeleteUsers && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUserClick(user)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Roles */}
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Gestión de Roles y Permisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Administra roles del sistema y sus permisos asociados</p>
                  <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Rol
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Rol</DialogTitle>
                        <DialogDescription>
                          Define un nuevo rol con sus permisos asociados.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="role-name">Nombre del Rol</Label>
                          <Input
                            id="role-name"
                            placeholder="Ej: Manager de Eventos"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role-description">Descripción</Label>
                          <Textarea
                            id="role-description"
                            placeholder="Describe las responsabilidades de este rol"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateRole} disabled={submitting}>
                            {submitting ? 'Creando...' : 'Crear Rol'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Lista de roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <Card key={role.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          <Badge variant={role.isSystem ? 'destructive' : 'default'}>
                            {role.isSystem ? 'Sistema' : 'Personalizado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{role.permissions.length} permisos</span>
                          <span>{role.userCount} usuarios</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Grupos */}
        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                Gestión de Grupos de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Organiza usuarios en grupos para una gestión más eficiente</p>
                  <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Grupo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                        <DialogDescription>
                          Define un nuevo grupo de usuarios con sus características.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="group-name">Nombre del Grupo</Label>
                          <Input
                            id="group-name"
                            placeholder="Ej: Organizadores Premium"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="group-description">Descripción</Label>
                          <Textarea
                            id="group-description"
                            placeholder="Describe el propósito de este grupo"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowGroupModal(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateGroup} disabled={submitting}>
                            {submitting ? 'Creando...' : 'Crear Grupo'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userGroups.map((group) => (
                    <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{group.name}</h3>
                          <Badge variant="outline">{group.memberCount} miembros</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <p className="text-xs text-gray-500">Creado: {formatDate(group.createdAt)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Sesiones */}
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sesiones Activas de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">Monitorea las sesiones activas y la actividad de usuarios</p>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Dispositivo</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Última Actividad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="font-medium">Usuario {session.userId}</div>
                          </TableCell>
                          <TableCell>{session.ipAddress}</TableCell>
                          <TableCell>{session.deviceBrowser || 'Desconocido'}</TableCell>
                          <TableCell>{session.locationCountry || 'Desconocida'}</TableCell>
                          <TableCell>{formatDateTime(session.lastActivity)}</TableCell>
                          <TableCell>
                            <Badge variant={session.isActive ? 'default' : 'secondary'}>
                              {session.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {session.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.success('Sesión terminada')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Terminar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Analytics */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estadísticas de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Usuarios</span>
                    <span className="font-bold text-2xl">{users.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Usuarios Activos</span>
                    <span className="font-bold text-green-600">{users.filter(u => u.isActive).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Usuarios Inactivos</span>
                    <span className="font-bold text-red-600">{users.filter(u => !u.isActive).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Distribución de Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['super_admin', 'admin', 'manager', 'organizer', 'speaker', 'participant', 'user'].map(role => {
                    const count = users.filter(u => u.role === role).length;
                    return (
                      <div key={role} className="flex justify-between items-center">
                        <span className="capitalize text-sm">
                          {role === 'super_admin' ? 'Super Admin' :
                           role === 'admin' ? 'Admin' :
                           role === 'manager' ? 'Manager' :
                           role === 'organizer' ? 'Organizador' :
                           role === 'speaker' ? 'Speaker' :
                           role === 'participant' ? 'Participante' : 'Usuario'}
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Sesiones Activas</span>
                    <span className="font-bold">{userSessions.filter(s => s.isActive).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Usuarios Conectados Hoy</span>
                    <span className="font-bold text-blue-600">
                      {users.filter(u => {
                        const lastLogin = new Date(u.lastLoginAt || 0);
                        const today = new Date();
                        return lastLogin.toDateString() === today.toDateString();
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles de usuario */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado, incluyendo perfil, estadísticas y auditoría.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => e.preventDefault()}>
            {selectedUser && (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                  <TabsTrigger value="audit">Auditoría</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Información Personal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                            <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                              {selectedUser.role === 'super_admin' ? 'Super Admin' :
                               selectedUser.role === 'admin' ? 'Admin' :
                               selectedUser.role === 'manager' ? 'Manager' :
                               selectedUser.role === 'organizer' ? 'Organizador' :
                               selectedUser.role === 'speaker' ? 'Speaker' : 'Usuario'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{selectedUser.email}</span>
                          </div>
                          {selectedUser.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{selectedUser.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Registrado: {formatDate(selectedUser.createdAt)}</span>
                          </div>
                          {selectedUser.lastLoginAt && (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span>Último acceso: {formatDate(selectedUser.lastLoginAt)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Estado de la Cuenta</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Estado:</span>
                          <Badge variant={selectedUser.isActive ? 'default' : 'destructive'}>
                            {selectedUser.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Email verificado:</span>
                          <Badge variant={selectedUser.isEmailVerified ? 'default' : 'secondary'}>
                            {selectedUser.isEmailVerified ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>2FA habilitado:</span>
                          <Badge variant={selectedUser.is2faEnabled ? 'default' : 'secondary'}>
                            {selectedUser.is2faEnabled ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>ID de usuario:</span>
                          <span className="font-mono text-sm">{selectedUser.id}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Estadísticas</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Total Eventos:</span> {userStats.totalEvents || 0}</p>
                          <p><span className="font-medium">Eventos Activos:</span> {userStats.activeEvents || 0}</p>
                          <p><span className="font-medium">Total Inscripciones:</span> {userStats.totalRegistrations || 0}</p>
                          <p><span className="font-medium">Ingresos Generados:</span> Q {userStats.totalRevenue?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Eventos y Cursos Inscritos</h4>
                        <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                          {Array.isArray(userRegistrations) && userRegistrations.length > 0 ? (
                            userRegistrations.slice(0, 5).map((reg: any) => (
                              <div key={reg.id} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                                <div className="flex-1">
                                  <p className="font-medium text-xs truncate">{reg.eventTitle}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(reg.eventDate).toLocaleDateString('es-GT')}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {reg.status === 'confirmed' ? 'Confirmado' :
                                   reg.status === 'pending' ? 'Pendiente' : reg.status}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-xs">No hay inscripciones registradas</p>
                          )}
                          {Array.isArray(userRegistrations) && userRegistrations.length > 5 && (
                            <p className="text-xs text-blue-600 mt-2">
                              +{userRegistrations.length - 5} más...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de Auditoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingAudit ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-gray-500">Cargando auditoría...</p>
                        </div>
                      ) : userAudit.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No hay registros de auditoría disponibles.</p>
                          <p className="text-sm">Los registros aparecerán aquí cuando haya actividad.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userAudit.map((log) => (
                            <div key={log.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{log.description}</p>
                                  <p className="text-sm text-gray-500">{log.action}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(log.createdAt).toLocaleString('es-GT')}
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                IP: {log.ipAddress}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="mt-1">
                      {selectedUser.role === 'super_admin' ? 'Super Admin' :
                       selectedUser.role === 'admin' ? 'Admin' :
                       selectedUser.role === 'manager' ? 'Manager' :
                       selectedUser.role === 'organizer' ? 'Organizador' :
                       selectedUser.role === 'speaker' ? 'Speaker' : 'Usuario'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Al eliminar este usuario, se perderá toda su información,
                  incluyendo registros de eventos, auditoría y estadísticas. Esta acción es irreversible.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUserConfirm}
              disabled={submitting}
            >
              {submitting ? 'Eliminando...' : 'Eliminar Usuario'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de acciones masivas */}
      <Dialog open={showBulkActionsModal} onOpenChange={setShowBulkActionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acciones Masivas</DialogTitle>
            <DialogDescription>
              Aplicar acciones a {selectedUsers.length} usuarios seleccionados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleBulkAction('activate', selectedUsers)}
                className="flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Activar Usuarios
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('deactivate', selectedUsers)}
                className="flex items-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Desactivar Usuarios
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('verify_email', selectedUsers)}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Verificar Emails
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('reset_password', selectedUsers)}
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Resetear Contraseñas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedUserManagementTab;