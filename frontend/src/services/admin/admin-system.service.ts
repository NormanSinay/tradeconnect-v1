// ====================================================================
// SERVICIO DE SISTEMA ADMINISTRATIVO
// ====================================================================
// @fileoverview Servicio para usuarios, roles, permisos y auditoría
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  UserRole,
  UserStatus,
  UserProfile,
  UserUpdateData,
  UserCreateData,
  Permission,
  RoleDefinition,
  RoleAssignment,
  RoleRevocation,
  UserRoleHistory,
  AuditAction,
  AuditSeverity,
  AuditLog,
  AuditFilters,
  AuditQueryParams,
  AuditSearchResult,
  SystemConfig,
  BackupConfig,
  SystemStats,
  PerformanceMetrics,
  SystemNotificationType,
  SystemNotification,
  SystemExportOptions,
  SystemExportResult,
  SystemImportOptions,
  SystemImportResult,
  MaintenanceTask,
  MaintenanceWindow,
  UserContext,
  UserAction,
  SessionStatus,
  SessionInfo,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa del sistema administrativo
 * Incluye usuarios, roles, permisos, auditoría y configuración del sistema
 */
export class AdminSystemService {
  private readonly baseUrl = '/admin/system'

  // ====================================================================
  // GESTIÓN DE USUARIOS
  // ====================================================================

  /**
   * Crea un nuevo usuario
   */
  async createUser(userData: UserCreateData): Promise<UserProfile> {
    try {
      const response = await api.post(`${this.baseUrl}/users`, userData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando usuario:', error)
      throw error
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(
    userId: number,
    userData: UserUpdateData
  ): Promise<UserProfile> {
    try {
      const response = await api.put(`${this.baseUrl}/users/${userId}`, userData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene perfil de usuario
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      const response = await api.get(`${this.baseUrl}/users/${userId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error)
      throw error
    }
  }

  /**
   * Lista usuarios con filtros
   */
  async getUsers(
    filters: {
      status?: UserStatus
      role?: UserRole
      search?: string
      startDate?: Date
      endDate?: Date
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<UserProfile>> {
    try {
      const response = await api.get(`${this.baseUrl}/users`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      throw error
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(userId: number): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/users/${userId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      throw error
    }
  }

  /**
   * Activa/desactiva un usuario
   */
  async toggleUserStatus(
    userId: number,
    active: boolean,
    reason?: string
  ): Promise<UserProfile> {
    try {
      const response = await api.patch(`${this.baseUrl}/users/${userId}/status`, {
        active,
        reason,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error)
      throw error
    }
  }

  // ====================================================================
  // GESTIÓN DE ROLES Y PERMISOS
  // ====================================================================

  /**
   * Crea un nuevo rol
   */
  async createRole(roleData: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleDefinition> {
    try {
      const response = await api.post(`${this.baseUrl}/roles`, roleData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando rol:', error)
      throw error
    }
  }

  /**
   * Actualiza un rol existente
   */
  async updateRole(
    roleId: number,
    roleData: Partial<RoleDefinition>
  ): Promise<RoleDefinition> {
    try {
      const response = await api.put(`${this.baseUrl}/roles/${roleId}`, roleData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando rol:', error)
      throw error
    }
  }

  /**
   * Obtiene un rol por ID
   */
  async getRoleById(roleId: number): Promise<RoleDefinition> {
    try {
      const response = await api.get(`${this.baseUrl}/roles/${roleId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo rol:', error)
      throw error
    }
  }

  /**
   * Lista roles disponibles
   */
  async getRoles(
    filters: { active?: boolean; search?: string } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<RoleDefinition>> {
    try {
      const response = await api.get(`${this.baseUrl}/roles`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo roles:', error)
      throw error
    }
  }

  /**
   * Elimina un rol
   */
  async deleteRole(roleId: number): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/roles/${roleId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando rol:', error)
      throw error
    }
  }

  // ====================================================================
  // ASIGNACIÓN DE ROLES
  // ====================================================================

  /**
   * Asigna rol a usuario
   */
  async assignRoleToUser(
    userId: number,
    roleId: number,
    assignmentData?: { expiresAt?: Date; assignedBy?: number }
  ): Promise<RoleAssignment> {
    try {
      const response = await api.post(
        `${this.baseUrl}/users/${userId}/roles/${roleId}`,
        assignmentData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error asignando rol a usuario:', error)
      throw error
    }
  }

  /**
   * Revoca rol de usuario
   */
  async revokeRoleFromUser(
    userId: number,
    roleId: number,
    revocationData?: { reason?: string; revokedBy?: number }
  ): Promise<RoleRevocation> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/users/${userId}/roles/${roleId}`,
        { data: revocationData }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error revocando rol de usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene roles de un usuario
   */
  async getUserRoles(userId: number): Promise<RoleDefinition[]> {
    try {
      const response = await api.get(`${this.baseUrl}/users/${userId}/roles`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo roles del usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene historial de roles de un usuario
   */
  async getUserRoleHistory(
    userId: number,
    filters: { startDate?: Date; endDate?: Date } = {}
  ): Promise<UserRoleHistory[]> {
    try {
      const response = await api.get(`${this.baseUrl}/users/${userId}/role-history`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo historial de roles:', error)
      throw error
    }
  }

  // ====================================================================
  // GESTIÓN DE PERMISOS
  // ====================================================================

  /**
   * Obtiene todos los permisos disponibles
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get(`${this.baseUrl}/permissions`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo permisos:', error)
      throw error
    }
  }

  /**
   * Actualiza permisos de un rol
   */
  async updateRolePermissions(
    roleId: number,
    permissionIds: number[]
  ): Promise<RoleDefinition> {
    try {
      const response = await api.put(`${this.baseUrl}/roles/${roleId}/permissions`, {
        permissionIds,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando permisos del rol:', error)
      throw error
    }
  }

  /**
   * Verifica permisos de un usuario
   */
  async checkUserPermissions(
    userId: number,
    permissions: string[]
  ): Promise<Record<string, boolean>> {
    try {
      const response = await api.post(`${this.baseUrl}/users/${userId}/check-permissions`, {
        permissions,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando permisos del usuario:', error)
      throw error
    }
  }

  // ====================================================================
  // AUDITORÍA Y LOGS
  // ====================================================================

  /**
   * Crea entrada de auditoría
   */
  async createAuditLog(
    auditData: Omit<AuditLog, 'id' | 'timestamp'>
  ): Promise<AuditLog> {
    try {
      const response = await api.post(`${this.baseUrl}/audit`, auditData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando entrada de auditoría:', error)
      throw error
    }
  }

  /**
   * Obtiene logs de auditoría
   */
  async getAuditLogs(
    filters: AuditFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AuditSearchResult> {
    try {
      const response = await api.get(`${this.baseUrl}/audit`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error)
      throw error
    }
  }

  /**
   * Obtiene log de auditoría por ID
   */
  async getAuditLogById(auditId: string): Promise<AuditLog> {
    try {
      const response = await api.get(`${this.baseUrl}/audit/${auditId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo log de auditoría:', error)
      throw error
    }
  }

  // ====================================================================
  // SESIONES Y CONTEXTO DE USUARIO
  // ====================================================================

  /**
   * Obtiene sesiones activas de un usuario
   */
  async getUserActiveSessions(userId: number): Promise<SessionInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/users/${userId}/sessions`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo sesiones activas del usuario:', error)
      throw error
    }
  }

  /**
   * Termina una sesión específica
   */
  async terminateUserSession(
    userId: number,
    sessionId: string
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/users/${userId}/sessions/${sessionId}/terminate`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error terminando sesión del usuario:', error)
      throw error
    }
  }

  /**
   * Termina todas las sesiones de un usuario excepto la actual
   */
  async terminateAllUserSessions(
    userId: number,
    currentSessionId?: string
  ): Promise<{ terminatedCount: number }> {
    try {
      const response = await api.post(`${this.baseUrl}/users/${userId}/sessions/terminate-all`, {
        currentSessionId,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error terminando todas las sesiones del usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene contexto actual del usuario
   */
  async getUserContext(userId: number): Promise<UserContext> {
    try {
      const response = await api.get(`${this.baseUrl}/users/${userId}/context`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo contexto del usuario:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN DEL SISTEMA
  // ====================================================================

  /**
   * Actualiza configuración del sistema
   */
  async updateSystemConfig(config: SystemConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración del sistema:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración actual del sistema
   */
  async getSystemConfig(): Promise<SystemConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración del sistema:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de backups
   */
  async updateBackupConfig(config: BackupConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/backup`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de backups:', error)
      throw error
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y MÉTRICAS
  // ====================================================================

  /**
   * Obtiene estadísticas del sistema
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error)
      throw error
    }
  }

  /**
   * Obtiene métricas de rendimiento
   */
  async getPerformanceMetrics(
    timeRange: { start: Date; end: Date }
  ): Promise<PerformanceMetrics> {
    try {
      const response = await api.get(`${this.baseUrl}/performance`, {
        params: {
          startDate: timeRange.start.toISOString(),
          endDate: timeRange.end.toISOString(),
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo métricas de rendimiento:', error)
      throw error
    }
  }

  // ====================================================================
  // MANTENIMIENTO
  // ====================================================================

  /**
   * Ejecuta tarea de mantenimiento
   */
  async executeMaintenanceTask(
    taskType: string,
    parameters?: Record<string, any>
  ): Promise<MaintenanceTask> {
    try {
      const response = await api.post(`${this.baseUrl}/maintenance/${taskType}`, parameters)
      return (response.data as any).data
    } catch (error) {
      console.error('Error ejecutando tarea de mantenimiento:', error)
      throw error
    }
  }

  /**
   * Obtiene estado de tareas de mantenimiento
   */
  async getMaintenanceTasks(): Promise<MaintenanceTask[]> {
    try {
      const response = await api.get(`${this.baseUrl}/maintenance/tasks`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo tareas de mantenimiento:', error)
      throw error
    }
  }

  /**
   * Programa ventana de mantenimiento
   */
  async scheduleMaintenanceWindow(
    windowData: Omit<MaintenanceWindow, 'id' | 'createdAt'>
  ): Promise<MaintenanceWindow> {
    try {
      const response = await api.post(`${this.baseUrl}/maintenance/windows`, windowData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error programando ventana de mantenimiento:', error)
      throw error
    }
  }

  // ====================================================================
  // NOTIFICACIONES DEL SISTEMA
  // ====================================================================

  /**
   * Crea notificación del sistema
   */
  async createSystemNotification(
    notificationData: Omit<SystemNotification, 'id' | 'createdAt' | 'sentAt'>
  ): Promise<SystemNotification> {
    try {
      const response = await api.post(`${this.baseUrl}/notifications`, notificationData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando notificación del sistema:', error)
      throw error
    }
  }

  /**
   * Obtiene notificaciones del sistema
   */
  async getSystemNotifications(
    filters: { type?: SystemNotificationType; sent?: boolean } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<SystemNotification>> {
    try {
      const response = await api.get(`${this.baseUrl}/notifications`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo notificaciones del sistema:', error)
      throw error
    }
  }

  // ====================================================================
  // IMPORTACIÓN Y EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta datos del sistema
   */
  async exportSystemData(
    options: SystemExportOptions
  ): Promise<SystemExportResult> {
    try {
      const response = await api.post(`${this.baseUrl}/export`, options)
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando datos del sistema:', error)
      throw error
    }
  }

  /**
   * Importa datos al sistema
   */
  async importSystemData(
    importData: SystemImportOptions,
    file: File
  ): Promise<SystemImportResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('options', JSON.stringify(importData))

      const response = await api.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error importando datos al sistema:', error)
      throw error
    }
  }

  // ====================================================================
  // ACCIONES DE USUARIO
  // ====================================================================

  /**
   * Registra acción de usuario
   */
  async logUserAction(
    userId: number,
    action: UserAction,
    context?: Record<string, any>
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/users/${userId}/actions`, {
        action,
        context,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error registrando acción de usuario:', error)
      throw error
    }
  }

  /**
   * Obtiene acciones de usuario
   */
  async getUserActions(
    userId: number,
    filters: { action?: string; startDate?: Date; endDate?: Date } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<UserAction>> {
    try {
      const response = await api.get(`${this.baseUrl}/users/${userId}/actions`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo acciones de usuario:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminSystemService = new AdminSystemService()