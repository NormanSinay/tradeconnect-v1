/**
 * @fileoverview Tipos TypeScript para el módulo de Eventos Híbridos
 * @version 1.0.0
 * @author TradeConnect Team
 */

/**
 * Tipos de modalidad híbrida
 */
export enum HybridModality {
  PRESENTIAL_ONLY = 'presential_only',
  VIRTUAL_ONLY = 'virtual_only',
  HYBRID = 'hybrid'
}

/**
 * Plataformas de videoconferencia soportadas
 */
export enum StreamingPlatform {
  ZOOM = 'zoom',
  GOOGLE_MEET = 'google_meet',
  MICROSOFT_TEAMS = 'microsoft_teams',
  JITSI = 'jitsi',
  CUSTOM_STREAMING = 'custom_streaming'
}

/**
 * Estados de streaming
 */
export enum StreamingStatus {
  IDLE = 'idle',
  STARTING = 'starting',
  ACTIVE = 'active',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error'
}

/**
 * Estados de participante virtual
 */
export enum VirtualParticipantStatus {
  INVITED = 'invited',
  JOINED = 'joined',
  LEFT = 'left',
  REMOVED = 'removed',
  BLOCKED = 'blocked'
}

/**
 * Roles de participante virtual
 */
export enum VirtualParticipantRole {
  ATTENDEE = 'attendee',
  PRESENTER = 'presenter',
  MODERATOR = 'moderator',
  ORGANIZER = 'organizer'
}

/**
 * Estados de sala virtual
 */
export enum VirtualRoomStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  FULL = 'full',
  CLOSED = 'closed'
}

/**
 * Calidades de streaming disponibles
 */
export enum StreamQuality {
  LOW_480P = '480p',
  MEDIUM_720P = '720p',
  HIGH_1080P = '1080p',
  ULTRA_4K = '4k'
}

/**
 * Tipos de mensaje en chat
 */
export enum ChatMessageType {
  TEXT = 'text',
  QUESTION = 'question',
  ANSWER = 'answer',
  SYSTEM = 'system'
}

/**
 * Estados de grabación
 */
export enum RecordingStatus {
  PENDING = 'pending',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

/**
 * Configuración de evento híbrido
 */
export interface HybridEventConfig {
  modality: HybridModality;
  presentialCapacity?: number;
  virtualCapacity?: number;
  presentialPrice?: number;
  virtualPrice?: number;
  streamingPlatform: StreamingPlatform;
  recordingEnabled: boolean;
  recordingRetentionDays: number;
  chatEnabled: boolean;
  qaEnabled: boolean;
  pollsEnabled: boolean;
  timezone: string;
  streamDelaySeconds: number;
  isActive?: boolean;
}

/**
 * Configuración de Zoom
 */
export interface ZoomConfig {
  meetingId?: string;
  meetingPassword?: string;
  joinUrl?: string;
  startUrl?: string;
  hostEmail?: string;
  alternativeHosts?: string[];
  autoRecording: boolean;
  waitingRoom: boolean;
  muteUponEntry: boolean;
  usePersonalMeetingId: boolean;
}

/**
 * Configuración de Google Meet
 */
export interface GoogleMeetConfig {
  meetUrl?: string;
  calendarEventId?: string;
  conferenceId?: string;
  requestId?: string;
}

/**
 * Configuración de Microsoft Teams
 */
export interface MicrosoftTeamsConfig {
  meetingUrl?: string;
  organizerId?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  meetingId?: string;
  joinUrl?: string;
  startTime?: Date;
  endTime?: Date;
}

/**
 * Configuración de Jitsi
 */
export interface JitsiConfig {
  roomName?: string;
  domain?: string;
  jwtToken?: string;
  appId?: string;
  appSecret?: string;
  moderatorPassword?: string;
  userPassword?: string;
  enableRecording: boolean;
  enableLivestreaming: boolean;
  livestreamingUrl?: string;
  livestreamingKey?: string;
}

/**
 * Configuración de streaming personalizado
 */
export interface CustomStreamingConfig {
  streamUrl?: string;
  streamKey?: string;
  backupStreamUrl?: string;
  backupStreamKey?: string;
  rtmpUrl?: string;
  hlsUrl?: string;
  qualities: StreamQuality[];
}

/**
 * Configuración de sala virtual
 */
export interface VirtualRoomConfig {
  name: string;
  capacity: number;
  platform: StreamingPlatform;
  moderators: number[];
  startTime?: Date;
  endTime?: Date;
  isPrivate: boolean;
  password?: string;
  description?: string;
}

/**
 * Participante virtual
 */
export interface VirtualParticipant {
  id?: number;
  eventId: number;
  userId: number;
  roomId?: number;
  accessToken: string;
  status: VirtualParticipantStatus;
  joinedAt?: Date;
  leftAt?: Date;
  totalTimeConnected: number;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    platform: string;
    browser: string;
  };
  connectionQuality?: {
    bitrate: number;
    latency: number;
    packetLoss: number;
  };
  lastActivity?: Date;
  isModerator: boolean;
  canChat: boolean;
  canQA: boolean;
}

/**
 * Mensaje de chat
 */
export interface ChatMessage {
  id?: number;
  eventId: number;
  roomId?: number;
  participantId: number;
  type: ChatMessageType;
  content: string;
  isPrivate: boolean;
  recipientId?: number;
  upvotes: number;
  isAnswered: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Grabación de evento
 */
export interface EventRecording {
  id?: number;
  eventId: number;
  roomId?: number;
  platform: StreamingPlatform;
  externalId?: string;
  fileUrl?: string;
  fileSize?: number;
  duration?: number;
  status: RecordingStatus;
  startTime: Date;
  endTime?: Date;
  downloadUrl?: string;
  thumbnailUrl?: string;
  transcriptUrl?: string;
  expiresAt?: Date;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
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
 * Webhook de plataforma externa
 */
export interface PlatformWebhook {
  id?: number;
  platform: StreamingPlatform;
  eventId: number;
  webhookId: string;
  eventType: string;
  payload: any;
  signature?: string;
  processed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt?: Date;
}

/**
 * Request para crear evento híbrido
 */
export interface CreateHybridEventRequest {
  eventId: number;
  config: HybridEventConfig;
  zoomConfig?: ZoomConfig;
  googleMeetConfig?: GoogleMeetConfig;
  teamsConfig?: MicrosoftTeamsConfig;
  jitsiConfig?: JitsiConfig;
  customStreamingConfig?: CustomStreamingConfig;
}

/**
 * Request para actualizar evento híbrido
 */
export interface UpdateHybridEventRequest {
  config?: Partial<HybridEventConfig>;
  zoomConfig?: Partial<ZoomConfig>;
  googleMeetConfig?: Partial<GoogleMeetConfig>;
  teamsConfig?: Partial<MicrosoftTeamsConfig>;
  jitsiConfig?: Partial<JitsiConfig>;
  customStreamingConfig?: Partial<CustomStreamingConfig>;
}

/**
 * Request para iniciar streaming
 */
export interface StartStreamingRequest {
  eventId: number;
  roomId?: number;
  quality?: StreamQuality;
  record?: boolean;
}

/**
 * Request para unirse a evento virtual
 */
export interface JoinVirtualEventRequest {
  eventId: number;
  roomId?: number;
  userAgent?: string;
  deviceInfo?: any;
}

/**
 * Response de acceso virtual
 */
export interface VirtualAccessResponse {
  accessToken: string;
  joinUrl: string;
  roomConfig: VirtualRoomConfig;
  participantConfig: {
    isModerator: boolean;
    canChat: boolean;
    canQA: boolean;
    permissions: string[];
  };
  expiresAt: Date;
}

/**
 * Request para enviar mensaje de chat
 */
export interface SendChatMessageRequest {
  eventId: number;
  roomId?: number;
  type: ChatMessageType;
  content: string;
  isPrivate?: boolean;
  recipientId?: number;
}

/**
 * Request para crear sala virtual
 */
export interface CreateVirtualRoomRequest {
  eventId: number;
  config: VirtualRoomConfig;
}

/**
 * Analytics de evento híbrido
 */
export interface HybridEventAnalytics {
  eventId: number;
  totalRegistrations: number;
  presentialRegistrations: number;
  virtualRegistrations: number;
  virtualParticipants: number;
  averageAttendanceTime: number;
  peakConcurrentViewers: number;
  totalChatMessages: number;
  totalQuestions: number;
  recordingsViews: number;
  streamingUptime: number;
  averageConnectionQuality: {
    bitrate: number;
    latency: number;
    packetLoss: number;
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicDistribution: Array<{
    country: string;
    count: number;
  }>;
}

// ====================================================================
// TIPOS PARA SERVICIOS
// ====================================================================

/**
 * Datos para crear evento híbrido
 */
export interface CreateHybridEventData {
  config: HybridEventConfig;
  streamingConfig?: ZoomConfig | GoogleMeetConfig | MicrosoftTeamsConfig | JitsiConfig | CustomStreamingConfig;
}

/**
 * Datos para actualizar evento híbrido
 */
export interface UpdateHybridEventData {
  config?: Partial<HybridEventConfig>;
  streamingConfig?: Partial<ZoomConfig | GoogleMeetConfig | MicrosoftTeamsConfig | JitsiConfig | CustomStreamingConfig>;
}

/**
 * Datos de evento híbrido completo
 */
export interface HybridEventData {
  id: number;
  eventId: number;
  config: HybridEventConfig;
  streamingConfig?: {
    platform: StreamingPlatform;
    meetingId?: string;
    streamUrl?: string;
    isActive: boolean;
  };
  virtualRooms: VirtualRoomData[];
  event: {
    id: number;
    title: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    virtualLocation?: string;
    isVirtual: boolean;
    creator?: {
      id: number;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos de configuración de streaming
 */
export interface StreamingConfigData {
  platform: StreamingPlatform;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  streamUrl?: string;
  streamKey?: string;
  isActive: boolean;
}

/**
 * Datos de sala virtual
 */
export interface VirtualRoomData {
  id: number;
  name: string;
  type: string;
  capacity: number;
  isActive: boolean;
}

/**
 * Filtros para búsqueda de eventos híbridos
 */
export interface HybridEventFilters {
  modality?: HybridModality;
  platform?: StreamingPlatform;
  createdBy?: number;
}

/**
 * Parámetros de consulta para eventos híbridos
 */
export interface HybridEventQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'modality' | 'platform';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: HybridEventFilters;
}

/**
 * Resultado de búsqueda de eventos híbridos
 */
export interface HybridEventSearchResult {
  hybridEvents: HybridEventData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: HybridEventFilters;
}
