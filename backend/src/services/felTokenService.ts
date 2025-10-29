/**
 * @fileoverview Servicio de Tokens FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión de tokens de autenticación FEL
 */

import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { FelToken } from '../models/FelToken';
import { FelAuditLog } from '../models/FelAuditLog';
import { ApiResponse } from '../types/global.types';

/**
 * Configuración de certificadores FEL
 */
interface FelCertifierConfig {
  name: string;
  url: string;
  authEndpoint: string;
  clientId: string;
  clientSecret: string;
  timeout: number;
}

/**
 * Respuesta de autenticación del certificador
 */
interface FelAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Servicio para gestión de tokens FEL
 */
export class FelTokenService {
  private certifiers: Map<string, FelCertifierConfig> = new Map();

  constructor() {
    this.initializeCertifiers();
  }

  /**
   * Inicializa la configuración de certificadores
   */
  private initializeCertifiers(): void {
    // Configuración de Infile (ejemplo)
    this.certifiers.set('infile', {
      name: 'Infile',
      url: process.env.FEL_INFILE_URL || 'https://apiv2.ifacere-fel.com',
      authEndpoint: '/api/auth/token',
      clientId: process.env.FEL_INFILE_CLIENT_ID || '',
      clientSecret: process.env.FEL_INFILE_CLIENT_SECRET || '',
      timeout: 30000
    });

    // Configuración de Dimexa (ejemplo)
    this.certifiers.set('dimexa', {
      name: 'Dimexa',
      url: process.env.FEL_DIMEXA_URL || 'https://fel.dimexa.com',
      authEndpoint: '/oauth/token',
      clientId: process.env.FEL_DIMEXA_CLIENT_ID || '',
      clientSecret: process.env.FEL_DIMEXA_CLIENT_SECRET || '',
      timeout: 30000
    });

    logger.info('FEL certifiers initialized', {
      count: this.certifiers.size,
      names: Array.from(this.certifiers.keys())
    });
  }

  /**
   * Obtiene un token activo para un certificador
   */
  async getActiveToken(certifierName: string): Promise<ApiResponse<FelToken>> {
    try {
      // Buscar token activo en base de datos
      const token = await FelToken.getActiveToken(certifierName);

      if (token) {
        // Verificar si necesita renovación
        if (token.needsRefresh) {
          logger.info(`Token needs refresh for ${certifierName}`);
          return await this.refreshToken(token);
        }

        return {
          success: true,
          message: 'Token activo encontrado',
          data: token,
          timestamp: new Date().toISOString()
        };
      }

      // No hay token activo, intentar autenticar
      return await this.authenticate(certifierName);

    } catch (error: any) {
      logger.error('Error getting active token', {
        certifierName,
        error: error.message
      });

      return {
        success: false,
        message: 'Error al obtener token activo',
        error: 'TOKEN_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Autentica con un certificador FEL
   */
  async authenticate(certifierName: string): Promise<ApiResponse<FelToken>> {
    try {
      const certifier = this.certifiers.get(certifierName);
      if (!certifier) {
        return {
          success: false,
          message: `Certificador ${certifierName} no configurado`,
          error: 'CERTIFIER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos de autenticación
      const authData = new URLSearchParams();
      authData.append('grant_type', 'client_credentials');
      authData.append('client_id', certifier.clientId);
      authData.append('client_secret', certifier.clientSecret);
      authData.append('scope', 'fel');

      const authUrl = `${certifier.url}${certifier.authEndpoint}`;

      logger.info('Authenticating with FEL certifier', { certifierName, url: authUrl });

      // Realizar petición de autenticación
      const response: AxiosResponse<FelAuthResponse> = await axios.post(
        authUrl,
        authData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: certifier.timeout
        }
      );

      const authResponse = response.data;

      // Crear token en base de datos
      const token = await FelToken.create({
        accessToken: authResponse.access_token,
        refreshToken: authResponse.refresh_token,
        tokenType: authResponse.token_type,
        expiresIn: authResponse.expires_in,
        expiresAt: new Date(Date.now() + (authResponse.expires_in * 1000)),
        status: 'active',
        certificadorUrl: certifier.url,
        certificadorName: certifier.name,
        metadata: {
          scope: authResponse.scope,
          authenticatedAt: new Date().toISOString()
        }
      });

      // Registrar en auditoría
      await FelAuditLog.logOperation({
        operationType: 'authentication',
        result: 'success',
        certificadorName: certifier.name,
        operationId: `auth_${Date.now()}`,
        responseData: {
          tokenType: authResponse.token_type,
          expiresIn: authResponse.expires_in,
          scope: authResponse.scope
        },
        processingTime: 0 // TODO: Calcular tiempo de procesamiento
      });

      logger.info('FEL authentication successful', {
        certifierName,
        tokenId: token.id,
        expiresAt: token.expiresAt
      });

      return {
        success: true,
        message: 'Autenticación exitosa',
        data: token,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('FEL authentication failed', {
        certifierName,
        error: error.message,
        response: error.response?.data
      });

      // Registrar error en auditoría
      await FelAuditLog.logOperation({
        operationType: 'authentication',
        result: 'failure',
        certificadorName: certifierName,
        operationId: `auth_${Date.now()}`,
        errorMessage: error?.message || 'Unknown error',
        responseData: error?.response?.data
      });

      return {
        success: false,
        message: 'Error en autenticación FEL',
        error: 'AUTHENTICATION_FAILED',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Renueva un token existente
   */
  async refreshToken(token: FelToken): Promise<ApiResponse<FelToken>> {
    try {
      if (!token.refreshToken) {
        return await this.authenticate(token.certificadorName);
      }

      const certifier = this.certifiers.get(token.certificadorName.toLowerCase());
      if (!certifier) {
        return {
          success: false,
          message: `Certificador ${token.certificadorName} no configurado`,
          error: 'CERTIFIER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos de renovación
      const refreshData = new URLSearchParams();
      refreshData.append('grant_type', 'refresh_token');
      refreshData.append('refresh_token', token.refreshToken);
      refreshData.append('client_id', certifier.clientId);
      refreshData.append('client_secret', certifier.clientSecret);

      const refreshUrl = `${certifier.url}${certifier.authEndpoint}`;

      logger.info('Refreshing FEL token', {
        certifierName: token.certificadorName,
        tokenId: token.id
      });

      // Realizar petición de renovación
      const response: AxiosResponse<FelAuthResponse> = await axios.post(
        refreshUrl,
        refreshData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: certifier.timeout
        }
      );

      const refreshResponse = response.data;

      // Actualizar token en base de datos
      await token.updateToken(
        refreshResponse.access_token,
        refreshResponse.refresh_token,
        refreshResponse.expires_in
      );

      // Registrar en auditoría
      await FelAuditLog.logOperation({
        operationType: 'token_refresh',
        result: 'success',
        certificadorName: token.certificadorName,
        operationId: `refresh_${Date.now()}`,
        responseData: {
          tokenType: refreshResponse.token_type,
          expiresIn: refreshResponse.expires_in
        },
        processingTime: 0 // TODO: Calcular tiempo de procesamiento
      });

      logger.info('FEL token refresh successful', {
        certifierName: token.certificadorName,
        tokenId: token.id,
        newExpiresAt: token.expiresAt
      });

      return {
        success: true,
        message: 'Token renovado exitosamente',
        data: token,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('FEL token refresh failed', {
        certifierName: token.certificadorName,
        tokenId: token.id,
        error: error.message
      });

      // Marcar token como expirado
      await token.markAsExpired();

      // Intentar nueva autenticación
      return await this.authenticate(token.certificadorName);
    }
  }

  /**
   * Revoca un token
   */
  async revokeToken(token: FelToken): Promise<ApiResponse<boolean>> {
    try {
      const certifier = this.certifiers.get(token.certificadorName.toLowerCase());
      if (!certifier) {
        return {
          success: false,
          message: `Certificador ${token.certificadorName} no configurado`,
          error: 'CERTIFIER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Intentar revocar en el certificador (si soporta)
      try {
        await axios.post(
          `${certifier.url}/oauth/revoke`,
          {
            token: token.accessToken,
            client_id: certifier.clientId,
            client_secret: certifier.clientSecret
          },
          { timeout: 10000 }
        );
      } catch (revokeError: any) {
        // Algunos certificadores no soportan revocación, continuar
        logger.warn('Token revocation not supported or failed', {
          certifierName: token.certificadorName,
          error: revokeError?.message || 'Unknown error'
        });
      }

      // Marcar como revocado en base de datos
      await token.markAsRevoked();

      // Registrar en auditoría
      await FelAuditLog.logOperation({
        operationType: 'token_refresh',
        result: 'success',
        certificadorName: token.certificadorName,
        operationId: `revoke_${Date.now()}`,
        responseData: { revoked: true }
      });

      return {
        success: true,
        message: 'Token revocado exitosamente',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error revoking FEL token', {
        certifierName: token.certificadorName,
        tokenId: token.id,
        error: error.message
      });

      return {
        success: false,
        message: 'Error al revocar token',
        error: 'TOKEN_REVOKE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Limpia tokens expirados
   */
  async cleanupExpiredTokens(): Promise<ApiResponse<number>> {
    try {
      const expiredTokens = await FelToken.getExpiredTokens();

      if (expiredTokens.length === 0) {
        return {
          success: true,
          message: 'No hay tokens expirados para limpiar',
          data: 0,
          timestamp: new Date().toISOString()
        };
      }

      let cleanedCount = 0;
      for (const token of expiredTokens) {
        try {
          await token.markAsExpired();
          cleanedCount++;
        } catch (error) {
          logger.error('Error marking token as expired', {
            tokenId: token.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      logger.info('Expired FEL tokens cleaned', { count: cleanedCount });

      return {
        success: true,
        message: `${cleanedCount} tokens expirados limpiados`,
        data: cleanedCount,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error cleaning expired tokens', error);

      return {
        success: false,
        message: 'Error al limpiar tokens expirados',
        error: 'CLEANUP_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de tokens
   */
  async getTokenStats(certifierName?: string): Promise<ApiResponse<any>> {
    try {
      const stats = await FelToken.getTokenStats(certifierName);

      return {
        success: true,
        message: 'Estadísticas de tokens obtenidas',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error getting token stats', { error: error?.message || 'Unknown error' });

      return {
        success: false,
        message: 'Error al obtener estadísticas de tokens',
        error: 'STATS_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica si un certificador está disponible
   */
  async checkCertifierHealth(certifierName: string): Promise<ApiResponse<boolean>> {
    try {
      const certifier = this.certifiers.get(certifierName);
      if (!certifier) {
        return {
          success: false,
          message: `Certificador ${certifierName} no configurado`,
          error: 'CERTIFIER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const startTime = Date.now();

      // Intentar obtener token para verificar conectividad
      const result = await this.getActiveToken(certifierName);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: `Certificador ${certifierName} ${result.success ? 'disponible' : 'no disponible'}`,
        data: result.success,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error checking certifier health', {
        certifierName,
        error: error.message
      });

      return {
        success: false,
        message: `Error al verificar salud del certificador ${certifierName}`,
        error: 'HEALTH_CHECK_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Instancia singleton del servicio de tokens FEL
 */
let felTokenServiceInstance: FelTokenService | null = null;

/**
 * Factory para obtener instancia del servicio de tokens FEL
 */
export function getFelTokenService(): FelTokenService {
  if (!felTokenServiceInstance) {
    felTokenServiceInstance = new FelTokenService();
  }

  return felTokenServiceInstance;
}

export const felTokenService = getFelTokenService();
