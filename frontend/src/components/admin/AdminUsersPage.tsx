import React, { useState, useEffect } from 'react'
import { FaUser, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaUserCheck, FaUserTimes, FaShieldAlt } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminSystemService } from '@/services/admin'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type {
  UserProfile,
  UserStatus,
  UserRole,
  AdminPaginatedResponse,
} from '@/types/admin'

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {}
      if (searchTerm) filters.search = searchTerm
      if (statusFilter !== 'all') filters.status = statusFilter
      if (roleFilter !== 'all') filters.role = roleFilter

      const response: AdminPaginatedResponse<UserProfile> = await adminSystemService.getUsers(
        filters,
        { page: currentPage, limit: 20 }
      )

      setUsers(response.data)
      setTotalPages(response.pagination.pages)
    } catch (err: any) {
      console.error('Error cargando usuarios:', err)
      setError('Error al cargar la lista de usuarios')
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado de usuario
  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await adminSystemService.toggleUserStatus(userId, !currentStatus, 'Cambio de estado por administrador')
      await loadUsers()
    } catch (err: any) {
      console.error('Error cambiando estado del usuario:', err)
      setError('Error al cambiar el estado del usuario')
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await adminSystemService.deleteUser(userId)
      await loadUsers()
    } catch (err: any) {
      console.error('Error eliminando usuario:', err)
      setError('Error al eliminar el usuario')
    }
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // Obtener badge de estado
  const getStatusBadge = (status: UserStatus) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Activo', color: 'text-green-700 bg-green-100' },
      inactive: { variant: 'secondary' as const, label: 'Inactivo', color: 'text-gray-700 bg-gray-100' },
      suspended: { variant: 'destructive' as const, label: 'Suspendido', color: 'text-red-700 bg-red-100' },
      pending_verification: { variant: 'outline' as const, label: 'Pendiente', color: 'text-yellow-700 bg-yellow-100' },
      locked: { variant: 'destructive' as const, label: 'Bloqueado', color: 'text-red-700 bg-red-100' },
    }

    const config = statusConfig[status] || statusConfig.active

    return (
      <Badge variant={config.variant} className={cn('font-medium', config.color)}>
        {config.label}
      </Badge>
    )
  }

  // Obtener badge de rol
  const getRoleBadge = (roles: UserRole[]) => {
    const roleLabels = {
      super_admin: 'Super Admin',
      admin: 'Administrador',
      organizer: 'Organizador',
      moderator: 'Moderador',
      support: 'Soporte',
      viewer: 'Visualizador',
    }

    return roles.map(role => (
      <Badge key={role} variant="outline" className="mr-1">
        {roleLabels[role] || role}
      </Badge>
    ))
  }

  useEffect(() => {
    loadUsers()
  }, [currentPage, searchTerm, statusFilter, roleFilter])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Usuarios' },
  ]

  if (loading && users.length === 0) {
    return (
      <AdminLayout title="Gestión de Usuarios" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Gestión de Usuarios" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Mensajes de error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTrash className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaFilter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                    <SelectItem value="pending_verification">Pendiente</SelectItem>
                    <SelectItem value="locked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="organizer">Organizador</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => navigate('/admin/usuarios/crear')}
                  className="w-full"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaUser className="h-5 w-5" />
              Usuarios ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Conexión</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={user.avatar}
                                alt={user.firstName}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <FaUser className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          {user.isEmailVerified && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getRoleBadge(user.roles)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserDetails(true)
                            }}
                          >
                            <FaEye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/usuarios/${user.id}/editar`)}
                          >
                            <FaEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/usuarios/${user.id}/roles`)}
                          >
                            <FaShieldAlt className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? (
                              <FaUserTimes className="h-4 w-4 text-red-500" />
                            ) : (
                              <FaUserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <FaTrash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalles del usuario */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Usuario</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedUser.avatar ? (
                    <img
                      className="h-16 w-16 rounded-full"
                      src={selectedUser.avatar}
                      alt={selectedUser.firstName}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <FaUser className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(selectedUser.isActive ? 'active' : 'inactive')}
                      {selectedUser.isEmailVerified && (
                        <Badge variant="outline">Email Verificado</Badge>
                      )}
                      {selectedUser.is2FAEnabled && (
                        <Badge variant="outline">2FA Habilitado</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <p>{selectedUser.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      NIT
                    </label>
                    <p>{selectedUser.nit || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CUI
                    </label>
                    <p>{selectedUser.cui || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Zona Horaria
                    </label>
                    <p>{selectedUser.timezone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Idioma
                    </label>
                    <p>{selectedUser.locale}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de Creación
                    </label>
                    <p>{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roles Asignados
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getRoleBadge(selectedUser.roles)}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default AdminUsersPage