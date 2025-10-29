/**
 * @fileoverview Tipos TypeScript específicos para streaming y videoconferencia
 * @version 1.0.0
 * @author TradeConnect Team
 */

/**
 * Estados de sesión de streaming
 */
export enum StreamingSessionStatus {
  SCHEDULED = 'scheduled',
  STARTING = 'starting',
  LIVE = 'live',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  ERROR = 'error',
  COMPLETED = 'completed'
}

/**
 * Tipos de contenido de streaming
 */
export enum StreamingContentType {
  EVENT = 'event',
  SESSION = 'session',
  WORKSHOP = 'workshop',
  WEBINAR = 'webinar',
  CONFERENCE = 'conference'
}

/**
 * Configuración de RTMP
 */
export interface RTMPConfig {
  serverUrl: string;
  streamKey: string;
  backupServerUrl?: string;
  backupStreamKey?: string;
  bitrate: number;
  resolution: string;
  fps: number;
}

/**
 * Configuración de HLS
 */
export interface HLSConfig {
  playlistUrl: string;
  segmentDuration: number;
  maxSegments: number;
  qualityLevels: Array<{
    bitrate: number;
    resolution: string;
    url: string;
  }>;
}

/**
 * Configuración de transcodificación
 */
export interface TranscodingConfig {
  enabled: boolean;
  qualities: Array<{
    name: string;
    bitrate: number;
    width: number;
    height: number;
    fps: number;
  }>;
  adaptiveStreaming: boolean;
}

/**
 * Configuración de grabación
 */
export interface RecordingConfig {
  enabled: boolean;
  format: 'mp4' | 'webm' | 'flv';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  storage: {
    provider: 'local' | 's3' | 'gcs' | 'azure';
    bucket?: string;
    path?: string;
    retentionDays: number;
  };
  autoDelete: boolean;
  generateThumbnail: boolean;
  extractAudio: boolean;
  transcribe: boolean;
}

/**
 * Configuración de CDN
 */
export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'akamai' | 'fastly' | 'custom';
  distributionId?: string;
  domain?: string;
  priceClass?: string;
  enableIPv6: boolean;
  cacheBehavior: {
    ttl: number;
    compress: boolean;
    cors: boolean;
  };
}

/**
 * Configuración de seguridad de streaming
 */
export interface StreamingSecurityConfig {
  tokenAuth: boolean;
  geoBlocking: {
    enabled: boolean;
    allowedCountries: string[];
    blockedCountries: string[];
  };
  ipWhitelist: string[];
  domainLock: string[];
  watermark: {
    enabled: boolean;
    text?: string;
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
  drm: {
    enabled: boolean;
    provider: 'widevine' | 'playready' | 'fairplay';
    licenseUrl?: string;
  };
}

/**
 * Configuración de chat en vivo
 */
export interface LiveChatConfig {
  enabled: boolean;
  moderated: boolean;
  maxMessageLength: number;
  rateLimit: {
    messagesPerMinute: number;
    burstLimit: number;
  };
  wordFilter: {
    enabled: boolean;
    bannedWords: string[];
    replaceWith: string;
  };
  emojiSupport: boolean;
  fileSharing: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

/**
 * Configuración de Q&A
 */
export interface QAConfig {
  enabled: boolean;
  moderated: boolean;
  anonymousQuestions: boolean;
  votingEnabled: boolean;
  maxQuestionLength: number;
  autoAnswer: boolean;
  aiSuggestions: boolean;
  categories: string[];
}

/**
 * Configuración de encuestas en vivo
 */
export interface LivePollConfig {
  enabled: boolean;
  maxPollsPerSession: number;
  allowMultipleAnswers: boolean;
  showResultsRealtime: boolean;
  anonymousVoting: boolean;
  exportResults: boolean;
}

/**
 * Configuración de analíticas de streaming
 */
export interface StreamingAnalyticsConfig {
  enabled: boolean;
  metrics: {
    concurrentViewers: boolean;
    totalViews: boolean;
    watchTime: boolean;
    dropOffRate: boolean;
    geographicData: boolean;
    deviceData: boolean;
    qualityMetrics: boolean;
    engagementMetrics: boolean;
  };
  realTimeDashboard: boolean;
  exportData: boolean;
  retentionDays: number;
}

/**
 * Sesión de streaming
 */
export interface StreamingSession {
  id?: number;
  sessionId: string;
  status: StreamingSessionStatus;
  platform: string;
  streamUrl?: string;
  viewerUrl?: string;
  startTime: Date;
  endTime?: Date;
  title?: string;
  description?: string;
}

/**
 * Métricas en tiempo real de streaming
 */
export interface RealTimeStreamingMetrics {
  sessionId: number;
  timestamp: Date;
  activeConnections: number;
  totalViews: number;
  currentBitrate: number;
  averageLatency: number;
  bufferUnderruns: number;
  droppedFrames: number;
  activeChatUsers: number;
  pendingQuestions: number;
  activePolls: number;
  geographicViewers: Array<{
    country: string;
    count: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
  };
}

/**
 * Evento de streaming
 */
export interface StreamingEvent {
  id?: number;
  sessionId: number;
  eventType: 'started' | 'stopped' | 'paused' | 'resumed' | 'error' | 'quality_changed' | 'viewer_joined' | 'viewer_left';
  timestamp: Date;
  data?: any;
  metadata?: any;
}

/**
 * Configuración de integración con Zoom
 */
export interface ZoomIntegrationConfig {
  apiKey: string;
  apiSecret: string;
  accountId: string;
  clientId: string;
  clientSecret: string;
  webhookSecret?: string;
  baseUrl: string;
  jwtExpiration: number;
}

/**
 * Configuración de integración con Google Meet
 */
export interface GoogleMeetIntegrationConfig {
  serviceAccountEmail: string;
  privateKey: string;
  projectId: string;
  calendarId?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Configuración de integración con Microsoft Teams
 */
export interface TeamsIntegrationConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  applicationId: string;
  permissions: string[];
}

/**
 * Respuesta de creación de reunión Zoom
 */
export interface ZoomMeetingResponse {
  id: number;
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
  join_url: string;
  start_url: string;
  password?: string;
  h323_password?: string;
  pstn_password?: string;
  encrypted_password?: string;
}

/**
 * Webhook de Zoom
 */
export interface ZoomWebhookPayload {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: {
      id: string;
      uuid: string;
      host_id: string;
      topic: string;
      start_time: string;
      duration: number;
      total_size: number;
      recording_count: number;
      share_url: string;
      recording_files: Array<{
        id: string;
        meeting_id: string;
        recording_start: string;
        recording_end: string;
        file_type: string;
        file_size: number;
        play_url: string;
        download_url: string;
        status: string;
        recording_type: string;
      }>;
    };
  };
}

/**
 * Request para crear reunión Zoom
 */
export interface CreateZoomMeetingRequest {
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  password?: string;
  agenda?: string;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    cn_meeting: boolean;
    in_meeting: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    watermark: boolean;
    use_pmi: boolean;
    approval_type: number;
    audio: string;
    auto_recording: string;
    enforce_login: boolean;
    enforce_login_domains: string;
    alternative_hosts: string;
    waiting_room: boolean;
  };
}

/**
 * Request para crear evento de Google Calendar
 */
export interface CreateGoogleCalendarEventRequest {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
      status: {
        statusCode: string;
      };
    };
  };
}

// ====================================================================
// TIPOS PARA SERVICIOS DE STREAMING
// ====================================================================

/**
 * Request para iniciar streaming
 */
export interface StartStreamingRequest {
  title?: string;
  description?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  record?: boolean;
  enableChat?: boolean;
  enableQA?: boolean;
  enablePolls?: boolean;
}

/**
 * Request para detener streaming
 */
export interface StopStreamingRequest {
  sessionId: string;
  reason?: string;
}

/**
 * Métricas de streaming
 */
export interface StreamingMetrics {
  eventId: number;
  roomId?: number;
  timestamp: Date;
  concurrentViewers: number;
  totalParticipants: number;
  averageBitrate: number;
  averageLatency: number;
  packetLoss: number;
  messagesSent: number;
  questionsAsked: number;
  pollsCreated: number;
  recordingsCreated: number;
}

/**
 * Credenciales de plataforma
 */
export interface PlatformCredentials {
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  accountId?: string;
  tenantId?: string;
  accessToken?: string;
  refreshToken?: string;
}
