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
import { Search, Plus, Eye, Edit, Trash2, Download, UserCheck, UserX, History, Mail, Phone, Calendar, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserManagementTabProps {
  activeTab: string;
}

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
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

const UserManagementTab: React.FC<UserManagementTabProps> = ({ activeTab }) => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAudit, setUserAudit] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>({});

  // Estado del formulario
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUsers();
    }
  }, [activeTab, currentPage, roleFilter, statusFilter]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        const params: any = {
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          isActive: statusFilter !== 'all' ? statusFilter === 'true' : undefined
        };

        const result = await DashboardService.getUsers(params);
        setUsers(result.users);
        setTotalPages(result.pagination.totalPages);
      }, 'Error al cargar usuarios');

      await loadData();
    } catch (error) {
      // Error ya manejado por withErrorHandling
      console.error('Error in loadUsers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, searchTerm, withErrorHandling]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers();
  };

  // Funciones para gestión de usuarios
  const handleUserStatusChange = async (userId: number, isActive: boolean) => {
    try {
      const updateData = withErrorHandling(async () => {
        await DashboardService.updateUserStatus(userId, isActive);
      }, `Error al ${isActive ? 'activar' : 'desactivar'} usuario`);

      await updateData();
      toast.success(`Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`);
      loadUsers();
    } catch (error) {
      // Error ya manejado por withErrorHandling
      console.error('Error in handleUserStatusChange:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      const deleteData = withErrorHandling(async () => {
        await DashboardService.deleteUser(userId);
      }, 'Error al eliminar usuario');

      await deleteData();
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error) {
      // Error ya manejado por withErrorHandling
      console.error('Error in handleDeleteUser:', error);
    }
  };

  // Funciones para formularios
  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!formData.email) errors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';

    if (!showEditModal) { // Solo validar password en creación
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
      role: 'user'
    });
    setFormErrors({});
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const createData = withErrorHandling(async () => {
        // Aquí iría la llamada a la API de creación cuando esté implementada
        // await DashboardService.createUser(formData);
        toast.success('Funcionalidad de creación de usuario en desarrollo');
      }, 'Error al crear usuario');

      await createData();
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      // Error ya manejado por withErrorHandling
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
        // Aquí iría la llamada a la API de actualización cuando esté implementada
        // await DashboardService.updateUser(selectedUser.id, formData);
        toast.success('Funcionalidad de edición de usuario en desarrollo');
      }, 'Error al actualizar usuario');

      await updateData();
      setShowEditModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      // Error ya manejado por withErrorHandling
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
      password: '', // No mostrar password
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const loadUserAudit = async (userId: number) => {
    try {
      setLoadingAudit(true);
      const loadAudit = withErrorHandling(async () => {
        const result = await DashboardService.getUserAudit(userId);
        setUserAudit(result.logs || []);
      }, 'Error al cargar auditoría del usuario');

      await loadAudit();
    } catch (error) {
      // Error ya manejado por withErrorHandling
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

  const handleExportUsers = () => {
    // Implementar exportación CSV/Excel
    toast.success('Funcionalidad de exportación en desarrollo');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'secondary';
      case 'organizer': return 'default';
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

  if (activeTab !== 'usuarios') return null;

  return (
    <div className="space-y-6">
      {/* Verificación de permisos */}
      {!permissions.canManageUsers && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para gestionar usuarios.
          </AlertDescription>
        </Alert>
      )}

      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
                </DialogHeader>
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
                        {permissions.canManageSystem && <SelectItem value="admin">Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateUser} disabled={submitting}>
                      {submitting ? 'Creando...' : 'Crear Usuario'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
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
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
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
                      {permissions.isSuperAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
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

      {/* Modal de detalles de usuario */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado, incluyendo perfil, estadísticas y auditoría.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="audit">Auditoría</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
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

              <TabsContent value="stats" className="space-y-4">
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

              <TabsContent value="audit" className="space-y-4">
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
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default UserManagementTab;