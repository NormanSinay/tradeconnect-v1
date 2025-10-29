/**
 * @fileoverview Tipos TypeScript para seguridad y auditoría
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos específicos para operaciones de seguridad
 *
 * Archivo: backend/src/types/security.types.ts
 */

// ====================================================================
// INTERFACES DE AUDITORÍA Y LOGGING
// ====================================================================

/**
 * Interface para entrada de log de auditoría
 */
export interface AuditLogEntry {
  /** ID único del log */
  id?: number;
  /** ID del usuario que realizó la acción (opcional) */
  userId?: number;
  /** Acción realizada */
  action: string;
  /** Recurso afectado */
  resource: string;
  /** ID específico del recurso */
  resourceId?: string;
  /** Valores anteriores (para operaciones de actualización) */
  oldValues?: Record<string, any>;
  /** Valores nuevos (para operaciones de actualización) */
  newValues?: Record<string, any>;
  /** Dirección IP del cliente */
  ipAddress: string;
  /** User-Agent del navegador */
  userAgent: string;
  /** Información adicional del evento */
  metadata?: Record<string, any>;
  /** Nivel de severidad */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Estado del evento */
  status: 'success' | 'failure' | 'warning';
  /** Timestamp del evento */
  timestamp?: Date;
}

/**
 * Interface para filtros de búsqueda de logs de auditoría
 */
export interface AuditLogFilters {
  /** ID del usuario */
  userId?: number;
  /** Acción específica */
  action?: string;
  /** Recurso afectado */
  resource?: string;
  /** Nivel de severidad */
  severity?: string[];
  /** Estado del evento */
  status?: string[];
  /** Dirección IP */
  ipAddress?: string;
  /** Fecha de inicio */
  startDate?: Date;
  /** Fecha de fin */
  endDate?: Date;
}

/**
 * Interface para reporte de auditoría
 */
export interface AuditReport {
  /** Período del reporte */
  period: {
    startDate: Date;
    endDate: Date;
  };
  /** Resumen estadístico */
  summary: {
    /** Total de eventos */
    totalEvents: number;
    /** Eventos por severidad */
    bySeverity: Record<string, number>;
    /** Eventos por estado */
    byStatus: Record<string, number>;
    /** Eventos por recurso */
    byResource: Record<string, number>;
  };
  /** Eventos críticos */
  criticalEvents: AuditLogEntry[];
  /** Usuarios más activos */
  topUsers: Array<{
    userId: number;
    userEmail: string;
    eventCount: number;
  }>;
  /** IPs más activas */
  topIPs: Array<{
    ipAddress: string;
    eventCount: number;
    lastActivity: Date;
  }>;
}

// ====================================================================
// INTERFACES DE DETECCIÓN DE AMENAZAS
// ====================================================================

/**
 * Interface para resultado de análisis de amenazas
 */
export interface ThreatAnalysisResult {
  /** Nivel de riesgo detectado */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Puntaje de riesgo (0-100) */
  riskScore: number;
  /** Indicadores de compromiso detectados */
  indicators: ThreatIndicator[];
  /** Recomendaciones de mitigación */
  recommendations: string[];
  /** Acciones automáticas tomadas */
  automatedActions: string[];
  /** Requiere intervención manual */
  requiresManualReview: boolean;
}

/**
 * Interface para indicador de amenaza
 */
export interface ThreatIndicator {
  /** Tipo de indicador */
  type: 'ip_reputation' | 'user_behavior' | 'login_pattern' | 'data_exfiltration' | 'brute_force' | 'suspicious_activity';
  /** Severidad del indicador */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Descripción del indicador */
  description: string;
  /** Evidencia que soporta el indicador */
  evidence: Record<string, any>;
  /** Timestamp de detección */
  detectedAt: Date;
  /** Confianza en la detección (0-100) */
  confidence: number;
}

/**
 * Interface para patrón de ataque detectado
 */
export interface AttackPattern {
  /** ID único del patrón */
  patternId: string;
  /** Nombre del patrón de ataque */
  name: string;
  /** Descripción del patrón */
  description: string;
  /** Técnica MITRE ATT&CK asociada */
  mitreTechnique?: string;
  /** Severidad del patrón */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Indicadores que conforman el patrón */
  indicators: ThreatIndicator[];
  /** Primera detección */
  firstSeen: Date;
  /** Última detección */
  lastSeen: Date;
  /** Frecuencia de ocurrencia */
  frequency: number;
  /** Estado del patrón */
  status: 'active' | 'mitigated' | 'false_positive';
}

// ====================================================================
// INTERFACES DE CONTROL DE ACCESO
// ====================================================================

/**
 * Interface para política de control de acceso
 */
export interface AccessControlPolicy {
  /** ID único de la política */
  policyId: string;
  /** Nombre de la política */
  name: string;
  /** Descripción de la política */
  description: string;
  /** Recursos afectados */
  resources: string[];
  /** Acciones permitidas */
  actions: string[];
  /** Condiciones para aplicar la política */
  conditions: AccessCondition[];
  /** Efecto de la política */
  effect: 'allow' | 'deny';
  /** Prioridad de la política (mayor número = mayor prioridad) */
  priority: number;
  /** Estado de la política */
  status: 'active' | 'inactive' | 'draft';
}

/**
 * Interface para condición de acceso
 */
export interface AccessCondition {
  /** Tipo de condición */
  type: 'user' | 'role' | 'ip' | 'time' | 'device' | 'location' | 'risk_score';
  /** Operador de comparación */
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  /** Valor para comparar */
  value: any;
  /** Si la condición es obligatoria */
  required: boolean;
}

/**
 * Interface para evaluación de política de acceso
 */
export interface AccessEvaluationResult {
  /** Si el acceso está permitido */
  allowed: boolean;
  /** Política que determinó el resultado */
  determiningPolicy?: AccessControlPolicy;
  /** Razón del resultado */
  reason: string;
  /** Condiciones evaluadas */
  evaluatedConditions: Array<{
    condition: AccessCondition;
    result: boolean;
    reason?: string;
  }>;
  /** Nivel de confianza en la evaluación */
  confidence: number;
}

// ====================================================================
// INTERFACES DE BLOQUEO Y MITIGACIÓN
// ====================================================================

/**
 * Interface para regla de bloqueo
 */
export interface BlockRule {
  /** ID único de la regla */
  ruleId: string;
  /** Nombre de la regla */
  name: string;
  /** Tipo de regla */
  type: 'ip_block' | 'user_block' | 'country_block' | 'rate_limit' | 'behavioral';
  /** Condiciones para activar la regla */
  conditions: BlockCondition[];
  /** Acción a tomar */
  action: 'block' | 'challenge' | 'monitor' | 'alert';
  /** Duración del bloqueo (en minutos) */
  duration: number;
  /** Severidad de la regla */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Estado de la regla */
  status: 'active' | 'inactive' | 'testing';
  /** Estadísticas de la regla */
  stats: {
    /** Veces que se activó */
    triggeredCount: number;
    /** Veces que bloqueó */
    blockedCount: number;
    /** Última activación */
    lastTriggered?: Date;
  };
}

/**
 * Interface para condición de bloqueo
 */
export interface BlockCondition {
  /** Campo a evaluar */
  field: string;
  /** Operador */
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  /** Valor de comparación */
  value: any;
  /** Peso de la condición */
  weight: number;
}

/**
 * Interface para incidente de seguridad
 */
export interface SecurityIncident {
  /** ID único del incidente */
  incidentId: string;
  /** Título del incidente */
  title: string;
  /** Descripción del incidente */
  description: string;
  /** Severidad del incidente */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Estado del incidente */
  status: 'open' | 'investigating' | 'mitigated' | 'closed' | 'false_positive';
  /** Categoría del incidente */
  category: 'brute_force' | 'unauthorized_access' | 'data_breach' | 'malware' | 'ddos' | 'other';
  /** Usuario afectado (si aplica) */
  affectedUserId?: number;
  /** IP involucrada */
  sourceIP?: string;
  /** Timestamp de detección */
  detectedAt: Date;
  /** Timestamp de resolución */
  resolvedAt?: Date;
  /** Usuario que reportó el incidente */
  reportedBy?: number;
  /** Usuario asignado para investigar */
  assignedTo?: number;
  /** Evidencia del incidente */
  evidence: SecurityEvidence[];
  /** Acciones tomadas */
  actions: SecurityAction[];
  /** Notas adicionales */
  notes: string;
}

/**
 * Interface para evidencia de seguridad
 */
export interface SecurityEvidence {
  /** Tipo de evidencia */
  type: 'log' | 'screenshot' | 'network_traffic' | 'file' | 'memory_dump' | 'other';
  /** Descripción de la evidencia */
  description: string;
  /** Ubicación de la evidencia */
  location: string;
  /** Hash de integridad (si aplica) */
  hash?: string;
  /** Timestamp de recolección */
  collectedAt: Date;
}

/**
 * Interface para acción de seguridad
 */
export interface SecurityAction {
  /** Tipo de acción */
  type: 'block_ip' | 'disable_user' | 'reset_password' | 'update_policy' | 'alert_admin' | 'other';
  /** Descripción de la acción */
  description: string;
  /** Usuario que realizó la acción */
  performedBy?: number;
  /** Timestamp de la acción */
  performedAt: Date;
  /** Resultado de la acción */
  result: 'success' | 'failure' | 'partial';
}

// ====================================================================
// INTERFACES DE MONITOREO Y ALERTAS
// ====================================================================

/**
 * Interface para métrica de seguridad
 */
export interface SecurityMetric {
  /** Nombre de la métrica */
  name: string;
  /** Valor actual */
  value: number;
  /** Unidad de medida */
  unit: string;
  /** Timestamp de medición */
  timestamp: Date;
  /** Umbrales configurados */
  thresholds: {
    warning: number;
    critical: number;
  };
  /** Estado actual */
  status: 'normal' | 'warning' | 'critical';
  /** Tendencia */
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Interface para alerta de seguridad
 */
export interface SecurityAlert {
  /** ID único de la alerta */
  alertId: string;
  /** Título de la alerta */
  title: string;
  /** Descripción de la alerta */
  description: string;
  /** Severidad de la alerta */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Categoría de la alerta */
  category: 'authentication' | 'authorization' | 'data_integrity' | 'availability' | 'other';
  /** Fuente de la alerta */
  source: string;
  /** Timestamp de generación */
  generatedAt: Date;
  /** Estado de la alerta */
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';
  /** Usuario asignado */
  assignedTo?: number;
  /** Métrica que generó la alerta */
  metric?: SecurityMetric;
  /** Acciones recomendadas */
  recommendedActions: string[];
  /** Notas adicionales */
  notes?: string;
}

/**
 * Interface para dashboard de seguridad
 */
export interface SecurityDashboard {
  /** Resumen general */
  overview: {
    /** Nivel de riesgo general */
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    /** Puntaje de riesgo promedio */
    averageRiskScore: number;
    /** Total de alertas activas */
    activeAlerts: number;
    /** Incidentes sin resolver */
    unresolvedIncidents: number;
  };
  /** Métricas clave */
  keyMetrics: SecurityMetric[];
  /** Alertas recientes */
  recentAlerts: SecurityAlert[];
  /** Incidentes activos */
  activeIncidents: SecurityIncident[];
  /** Tendencias de seguridad */
  trends: {
    /** Eventos de seguridad por día */
    eventsPerDay: Array<{ date: string; count: number }>;
    /** Nivel de riesgo por día */
    riskLevelPerDay: Array<{ date: string; level: string }>;
    /** IPs bloqueadas por día */
    blockedIPsPerDay: Array<{ date: string; count: number }>;
  };
}

// ====================================================================
// INTERFACES DE CONFIGURACIÓN DE SEGURIDAD
// ====================================================================

/**
 * Interface para configuración de seguridad del sistema
 */
export interface SecurityConfiguration {
  /** Configuración de autenticación */
  authentication: {
    /** Longitud máxima de sesión */
    maxSessionDuration: number;
    /** Intentos de login permitidos */
    maxLoginAttempts: number;
    /** Duración de bloqueo por intentos fallidos */
    lockoutDuration: number;
    /** Requerir 2FA para roles específicos */
    require2FAForRoles: string[];
    /** Permitir recordar sesión */
    allowRememberMe: boolean;
  };
  /** Configuración de autorización */
  authorization: {
    /** Políticas de control de acceso */
    accessPolicies: AccessControlPolicy[];
    /** Reglas de bloqueo */
    blockRules: BlockRule[];
    /** Roles por defecto */
    defaultRoles: string[];
  };
  /** Configuración de auditoría */
  auditing: {
    /** Eventos a auditar */
    auditEvents: string[];
    /** Retención de logs (días) */
    logRetentionDays: number;
    /** Nivel de detalle de logs */
    logLevel: 'basic' | 'detailed' | 'verbose';
  };
  /** Configuración de monitoreo */
  monitoring: {
    /** Métricas a monitorear */
    monitoredMetrics: string[];
    /** Umbrales de alerta */
    alertThresholds: Record<string, { warning: number; critical: number }>;
    /** Frecuencia de verificación */
    checkFrequency: number;
  };
}

// ====================================================================
// TYPES ADICIONALES
// ====================================================================

/**
 * Estados posibles de un incidente de seguridad
 */
export type SecurityIncidentStatus =
  | 'open'
  | 'investigating'
  | 'mitigated'
  | 'closed'
  | 'false_positive';

/**
 * Categorías de incidentes de seguridad
 */
export type SecurityIncidentCategory =
  | 'brute_force'
  | 'unauthorized_access'
  | 'data_breach'
  | 'malware'
  | 'ddos'
  | 'phishing'
  | 'insider_threat'
  | 'other';

/**
 * Tipos de evidencia de seguridad
 */
export type SecurityEvidenceType =
  | 'log_entry'
  | 'network_packet'
  | 'file_hash'
  | 'memory_dump'
  | 'screenshot'
  | 'user_report'
  | 'system_alert';

/**
 * Niveles de riesgo de seguridad
 */
export type SecurityRiskLevel =
  | 'none'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

/**
 * Estados de alerta de seguridad
 */
export type SecurityAlertStatus =
  | 'new'
  | 'acknowledged'
  | 'investigating'
  | 'resolved'
  | 'dismissed';
