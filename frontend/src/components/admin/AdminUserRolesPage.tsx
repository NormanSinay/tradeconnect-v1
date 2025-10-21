import React, { useState, useEffect } from 'react'
import { FaShieldAlt, FaPlus, FaMinus, FaUser, FaCheck, FaTimes, FaHistory } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { adminSystemService } from '@/services/admin'
import { useNavigate, useParams } from 'react-router-dom'
import type {
  UserProfile,
  RoleDefinition,
  UserRoleHistory,
  UserRole,
} from '@/types/admin'

const AdminUserRolesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userRoles, setUserRoles] = useState<RoleDefinition[]>([])
  const [availableRoles, setAvailableRoles] = useState<RoleDefinition[]>([])
  const [roleHistory, setRoleHistory] = useState<UserRoleHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const [assignmentReason, setAssignmentReason] = useState('')
  const [revocationReason, setRevocationReason] = useState('')

  // Cargar datos del usuario y roles
  const loadData = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      const [userData, userRolesData, allRolesData, historyData] = await Promise.all([
        adminSystemService.getUserProfile(parseInt(id)),
        adminSystemService.getUserRoles(parseInt(id)),
        adminSystemService.getRoles(),
        adminSystemService.getUserRoleHistory(parseInt(id)),
      ])

      setUser(userData)
      setUserRoles(userRolesData)
      setAvailableRoles(allRolesData.data)
      setRoleHistory(historyData)
    } catch (err: any) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar los datos del usuario')
    } finally {
      setIsLoading(false)
    }
  }

  // Asignar rol a usuario
  const handleAssignRole = async () => {
    if (!id || !selectedRole || !assignmentReason.trim()) return

    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      await adminSystemService.assignRoleToUser(parseInt(id), selectedRole, {
        assignedBy: 1, // TODO: Obtener del contexto de usuario actual
        reason: assignmentReason.trim(),
      })

      setSuccess('Rol asignado exitosamente')
      setShowAssignDialog(false)
      setSelectedRole('')
      setAssignmentReason('')

      // Recargar datos
      await loadData()

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error asignando rol:', err)
      setError(err.message || 'Error al asignar el rol')
    } finally {
      setIsProcessing(false)
    }
  }

  // Revocar rol de usuario
  const handleRevokeRole = async (roleId: number) => {
    if (!id || !revocationReason.trim()) return

    if (!confirm('¿Está seguro de que desea revocar este rol del usuario?')) {
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      await adminSystemService.revokeRoleFromUser(parseInt(id), roleId, {
        reason: revocationReason.trim(),
        revokedBy: 1, // TODO: Obtener del contexto de usuario actual
      })

      setSuccess('Rol revocado exitosamente')
      setRevocationReason('')

      // Recargar datos
      await loadData()

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error revocando rol:', err)
      setError(err.message || 'Error al revocar el rol')
    } finally {
      setIsProcessing(false)
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

  // Obtener roles disponibles para asignar
  const getAvailableRolesForAssignment = () => {
    const assignedRoleNames = userRoles.map(role => role.name)
    return availableRoles.filter(role => !assignedRoleNames.includes(role.name))
  }

  // Obtener badge de evento de historial
  const getHistoryEventBadge = (event: string) => {
    const config = {
      assigned: { label: 'Asignado', color: 'bg-green-100 text-green-800' },
      revoked: { label: 'Revocado', color: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirado', color: 'bg-yellow-100 text-yellow-800' },
    }

    const eventConfig = config[event as keyof typeof config] || { label: event, color: 'bg-gray-100 text-gray-800' }

    return (
      <Badge className={`${eventConfig.color} font-medium`}>
        {eventConfig.label}
      </Badge>
    )
  }

  useEffect(() => {
    loadData()
  }, [id])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Usuarios', href: '/admin/usuarios' },
    { label: 'Roles del Usuario' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Gestión de Roles" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout title="Gestión de Roles" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaTimes className="h-5 w-5 text-red-500" />
              <span className="text-red-700">Usuario no encontrado</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Roles de ${user.firstName} ${user.lastName}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Mensajes de estado */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimes className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaCheck className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaUser className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium text-gray-600">Nombre:</span>
                <p className="mt-1">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Estado:</span>
                <p className="mt-1">
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Roles Actuales:</span>
                <p className="mt-1">{userRoles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles actuales */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FaShieldAlt className="h-5 w-5" />
                Roles Asignados ({userRoles.length})
              </CardTitle>
              <div className="flex gap-2">
                <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <FaPlus className="h-4 w-4 mr-2" />
                      Asignar Rol
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Asignar Nuevo Rol</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role">Rol a Asignar</Label>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableRolesForAssignment().map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.displayName} - {role.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reason">Razón de la Asignación</Label>
                        <Textarea
                          id="reason"
                          value={assignmentReason}
                          onChange={(e) => setAssignmentReason(e.target.value)}
                          placeholder="Explique por qué se está asignando este rol..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowAssignDialog(false)}
                          disabled={isProcessing}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAssignRole}
                          disabled={isProcessing || !selectedRole || !assignmentReason.trim()}
                        >
                          {isProcessing ? 'Asignando...' : 'Asignar Rol'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FaHistory className="h-4 w-4 mr-2" />
                      Historial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Historial de Roles</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {roleHistory.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Evento</TableHead>
                              <TableHead>Rol</TableHead>
                              <TableHead>Razón</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {roleHistory.flatMap((history) =>
                              history.history.map((entry, index) => (
                                <TableRow key={`${history.userId}-${index}`}>
                                  <TableCell>{formatDate(entry.timestamp)}</TableCell>
                                  <TableCell>{getHistoryEventBadge(entry.event)}</TableCell>
                                  <TableCell>{entry.role}</TableCell>
                                  <TableCell>{entry.reason || '-'}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center text-gray-500">No hay historial disponible</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {userRoles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rol</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.displayName}</div>
                          <div className="text-sm text-gray-500">{role.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeRole(role.id)}
                          disabled={isProcessing}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaMinus className="h-4 w-4 mr-1" />
                          Revocar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FaShieldAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Este usuario no tiene roles asignados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/usuarios')}
          >
            <FaTimes className="h-4 w-4 mr-2" />
            Volver a Usuarios
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/usuarios/${id}/editar`)}
          >
            <FaUser className="h-4 w-4 mr-2" />
            Editar Usuario
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminUserRolesPage