/**
 * @fileoverview Servicio para gestión de usuarios y dashboard
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios para consumir APIs de usuario y dashboard
 */

import { useAuthStore } from '@/stores/authStore';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  nit?: string;
  cui?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  is2faEnabled: boolean;
  timezone: string;
  locale: string;
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  activeEvents: number;
  completedEvents: number;
  certificates: number;
  trainingHours: number;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  nit?: string;
  cui?: string;
  timezone?: string;
  locale?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  error?: string;
}

/**
 * Servicio para operaciones de usuario
 */
export class UserService {
  private static readonly BASE_URL = '/api/v1';

  /**
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(): Promise<UserProfile> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<UserProfile> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo perfil');
    }

    return data.data!;
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(updateData: UserUpdateData): Promise<UserProfile> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    const data: ApiResponse<{ user: UserProfile }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error actualizando perfil');
    }

    return data.data!.user;
  }

  /**
   * Obtener estadísticas del usuario
   */
  static async getUserStats(): Promise<UserStats> {
    const { token } = useAuthStore.getState();

    const response = await fetch(`${this.BASE_URL}/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data: ApiResponse<UserStats> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error obteniendo estadísticas');
    }

    return data.data!;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  static hasRole(user: UserProfile | null, role: string): boolean {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }

  /**
   * Verificar si el usuario es administrador
   */
  static isAdmin(user: UserProfile | null): boolean {
    return this.hasRole(user, 'super_admin') || this.hasRole(user, 'admin');
  }

  /**
   * Verificar si el usuario es participante
   */
  static isParticipant(user: UserProfile | null): boolean {
    return this.hasRole(user, 'participant');
  }

  /**
   * Verificar si el usuario es speaker
   */
  static isSpeaker(user: UserProfile | null): boolean {
    return this.hasRole(user, 'speaker');
  }

  /**
   * Obtener el rol principal del usuario
   */
  static getPrimaryRole(user: UserProfile | null): string {
    if (!user || !user.roles || user.roles.length === 0) return 'user';

    // Orden de prioridad de roles
    const rolePriority = ['super_admin', 'admin', 'manager', 'operator', 'speaker', 'participant', 'user'];

    for (const role of rolePriority) {
      if (user.roles.includes(role)) {
        return role;
      }
    }

    return user.roles[0];
  }

  /**
   * Obtener nombre completo del usuario
   */
  static getFullName(user: UserProfile | null): string {
    if (!user) return 'Usuario';
    return user.fullName || `${user.firstName} ${user.lastName}`;
  }

  /**
   * Obtener iniciales del usuario
   */
  static getInitials(user: UserProfile | null): string {
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}