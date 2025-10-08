/**
 * @fileoverview Servicio de WebSocket/Socket.io para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Manejo de conexiones WebSocket para comunicación en tiempo real
 *
 * Archivo: backend/src/services/socketService.ts
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { virtualParticipantService } from './virtualParticipantService';
import { streamingService } from './streamingService';
import { hybridEventService } from './hybridEventService';
import { VirtualParticipant } from '../models/VirtualParticipant';
import { HybridEvent } from '../models/HybridEvent';
import { User } from '../models/User';

/**
 * Tipos de eventos de Socket.io
 */
export enum SocketEventType {
  // Conexión y autenticación
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  UNAUTHORIZED = 'unauthorized',

  // Participantes virtuales
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',
  PARTICIPANT_REMOVED = 'participant_removed',

  // Streaming
  STREAMING_STARTED = 'streaming_started',
  STREAMING_STOPPED = 'streaming_stopped',
  STREAMING_STATUS_UPDATE = 'streaming_status_update',

  // Chat
  CHAT_MESSAGE = 'chat_message',
  CHAT_MESSAGE_RECEIVED = 'chat_message_received',
  CHAT_MESSAGE_DELETED = 'chat_message_deleted',
  CHAT_USER_TYPING = 'chat_user_typing',

  // Q&A
  QA_QUESTION = 'qa_question',
  QA_QUESTION_ANSWERED = 'qa_question_answered',
  QA_QUESTION_UPVOTED = 'qa_question_upvoted',

  // Encuestas
  POLL_CREATED = 'poll_created',
  POLL_VOTE = 'poll_vote',
  POLL_RESULTS = 'poll_results',
  POLL_CLOSED = 'poll_closed',

  // Moderación
  MODERATOR_ACTION = 'moderator_action',
  USER_MUTED = 'user_muted',
  USER_UNMUTED = 'user_unmuted',

  // Notificaciones
  NOTIFICATION = 'notification',
  SYSTEM_MESSAGE = 'system_message',

  // Estadísticas
  PARTICIPANT_COUNT_UPDATE = 'participant_count_update',
  STREAMING_METRICS_UPDATE = 'streaming_metrics_update'
}

/**
 * Interface para datos de autenticación de socket
 */
export interface SocketAuthData {
  token: string;
  eventId: number;
  roomId?: number;
}

/**
 * Interface para mensaje de chat
 */
export interface ChatMessage {
  id: string;
  eventId: number;
  roomId?: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  isModerator: boolean;
  type: 'text' | 'system' | 'moderator';
}

/**
 * Interface para pregunta Q&A
 */
export interface QAQuestion {
  id: string;
  eventId: number;
  roomId?: number;
  userId: number;
  userName: string;
  question: string;
  timestamp: Date;
  upvotes: number;
  answered: boolean;
  answer?: string;
  answeredBy?: number;
  answeredAt?: Date;
}

/**
 * Interface para encuesta
 */
export interface LivePoll {
  id: string;
  eventId: number;
  roomId?: number;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  endsAt?: Date;
}

/**
 * Servicio para manejo de conexiones WebSocket
 */
export class SocketService {
  private io: SocketIOServer;
  private connectedSockets: Map<string, Socket> = new Map();
  private eventRooms: Map<number, Set<string>> = new Map();
  private participantSockets: Map<number, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    this.setupServiceListeners();

    logger.info('Socket.io service initialized');
  }

  /**
   * Configura los manejadores de eventos de Socket.io
   */
  private setupEventHandlers(): void {
    this.io.on(SocketEventType.CONNECT, (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Autenticación
      socket.on(SocketEventType.AUTHENTICATE, async (data: SocketAuthData) => {
        await this.handleAuthentication(socket, data);
      });

      // Chat
      socket.on(SocketEventType.CHAT_MESSAGE, async (data: any) => {
        await this.handleChatMessage(socket, data);
      });

      socket.on(SocketEventType.CHAT_USER_TYPING, async (data: any) => {
        await this.handleUserTyping(socket, data);
      });

      // Q&A
      socket.on(SocketEventType.QA_QUESTION, async (data: any) => {
        await this.handleQAQuestion(socket, data);
      });

      socket.on(SocketEventType.QA_QUESTION_UPVOTED, async (data: any) => {
        await this.handleQAUpvote(socket, data);
      });

      // Encuestas
      socket.on(SocketEventType.POLL_VOTE, async (data: any) => {
        await this.handlePollVote(socket, data);
      });

      // Desconexión
      socket.on(SocketEventType.DISCONNECT, () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Configura listeners para eventos de otros servicios
   */
  private setupServiceListeners(): void {
    // Eventos de participantes virtuales
    const participantEmitter = virtualParticipantService.getEventEmitter();

    participantEmitter.on('VirtualParticipantJoined', (data: any) => {
      this.broadcastToEvent(data.eventId, SocketEventType.PARTICIPANT_JOINED, {
        participantId: data.participantId,
        userId: data.userId,
        roomId: data.roomId
      });
      this.updateParticipantCount(data.eventId);
    });

    participantEmitter.on('VirtualParticipantLeft', (data: any) => {
      this.broadcastToEvent(data.eventId, SocketEventType.PARTICIPANT_LEFT, {
        participantId: data.participantId,
        userId: data.userId,
        roomId: data.roomId,
        sessionTime: data.sessionTime
      });
      this.updateParticipantCount(data.eventId);
    });

    participantEmitter.on('VirtualParticipantRemoved', (data: any) => {
      this.broadcastToEvent(data.eventId, SocketEventType.PARTICIPANT_REMOVED, {
        participantId: data.participantId,
        userId: data.userId,
        removedBy: data.removedBy,
        reason: data.reason
      });
    });

    // Eventos de streaming
    const streamingEmitter = streamingService.getEventEmitter();

    streamingEmitter.on('StreamingStarted', (data: any) => {
      this.broadcastToEvent(data.hybridEventId, SocketEventType.STREAMING_STARTED, {
        sessionId: data.sessionId,
        roomId: data.roomId,
        streamingConfig: data.streamingConfig,
        startedBy: data.startedBy
      });
    });

    streamingEmitter.on('StreamingStopped', (data: any) => {
      this.broadcastToEvent(data.hybridEventId, SocketEventType.STREAMING_STOPPED, {
        sessionId: data.sessionId,
        roomId: data.roomId,
        streamingConfig: data.streamingConfig,
        stoppedBy: data.stoppedBy
      });
    });
  }

  /**
   * Maneja la autenticación de socket
   */
  private async handleAuthentication(socket: Socket, data: SocketAuthData): Promise<void> {
    try {
      // Validar token de acceso
      const participant = await virtualParticipantService.validateAccessToken(data.token, data.eventId);

      if (!participant) {
        socket.emit(SocketEventType.UNAUTHORIZED, { message: 'Token inválido o expirado' });
        socket.disconnect();
        return;
      }

      // Verificar que el evento existe y está activo
      const hybridEvent = await HybridEvent.findOne({
        where: { eventId: data.eventId }
      });

      if (!hybridEvent || !hybridEvent.isActive) {
        socket.emit(SocketEventType.UNAUTHORIZED, { message: 'Evento no encontrado o inactivo' });
        socket.disconnect();
        return;
      }

      // Unir socket a salas
      socket.join(`event_${data.eventId}`);
      if (data.roomId) {
        socket.join(`room_${data.roomId}`);
      }

      // Registrar socket conectado
      this.connectedSockets.set(socket.id, socket);
      this.addToEventRoom(data.eventId, socket.id);

      if (participant.userId) {
        this.addToParticipantSockets(participant.userId, socket.id);
      }

      // Actualizar actividad del participante
      await virtualParticipantService.updateParticipantActivity(participant.id, {
        lastActivity: new Date()
      });

      // Confirmar autenticación
      socket.emit(SocketEventType.AUTHENTICATED, {
        eventId: data.eventId,
        roomId: data.roomId,
        participantId: participant.id,
        userId: participant.userId,
        permissions: {
          canChat: participant.canChat,
          canQA: participant.canQA,
          isModerator: participant.isModerator
        }
      });

      logger.info(`Socket authenticated: ${socket.id} for event ${data.eventId}`);

    } catch (error) {
      logger.error('Error authenticating socket:', error);
      socket.emit(SocketEventType.UNAUTHORIZED, { message: 'Error de autenticación' });
      socket.disconnect();
    }
  }

  /**
   * Maneja mensajes de chat
   */
  private async handleChatMessage(socket: Socket, data: any): Promise<void> {
    try {
      const auth = (socket as any).auth;
      if (!auth) {
        socket.emit('error', { message: 'No autenticado' });
        return;
      }

      // Validar mensaje
      if (!data.message || data.message.trim().length === 0) {
        socket.emit('error', { message: 'Mensaje vacío' });
        return;
      }

      if (data.message.length > 500) {
        socket.emit('error', { message: 'Mensaje demasiado largo' });
        return;
      }

      // Obtener información del usuario
      const participant = await VirtualParticipant.findByPk(auth.participantId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!participant || !participant.canChat) {
        socket.emit('error', { message: 'No tienes permisos para enviar mensajes' });
        return;
      }

      // Crear mensaje de chat
      const chatMessage: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId: auth.eventId,
        roomId: auth.roomId,
        userId: participant.userId,
        userName: participant.user?.fullName || 'Usuario',
        userAvatar: participant.user?.avatar,
        message: data.message.trim(),
        timestamp: new Date(),
        isModerator: participant.isModerator,
        type: participant.isModerator ? 'moderator' : 'text'
      };

      // Actualizar actividad
      await virtualParticipantService.updateParticipantActivity(participant.id, {
        lastActivity: new Date()
      });

      // Broadcast del mensaje
      const room = auth.roomId ? `room_${auth.roomId}` : `event_${auth.eventId}`;
      this.io.to(room).emit(SocketEventType.CHAT_MESSAGE_RECEIVED, chatMessage);

      // Confirmar envío al remitente
      socket.emit('chat_message_sent', { messageId: chatMessage.id });

      logger.info(`Chat message sent: ${socket.id} in event ${auth.eventId}`);

    } catch (error) {
      logger.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  }

  /**
   * Maneja indicador de escritura
   */
  private async handleUserTyping(socket: Socket, data: any): Promise<void> {
    try {
      const auth = (socket as any).auth;
      if (!auth) return;

      const participant = await VirtualParticipant.findByPk(auth.participantId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!participant || !participant.canChat) return;

      const typingData = {
        userId: participant.userId,
        userName: participant.user?.fullName || 'Usuario',
        isTyping: data.isTyping || false
      };

      const room = auth.roomId ? `room_${auth.roomId}` : `event_${auth.eventId}`;
      socket.to(room).emit(SocketEventType.CHAT_USER_TYPING, typingData);

    } catch (error) {
      logger.error('Error handling user typing:', error);
    }
  }

  /**
   * Maneja preguntas Q&A
   */
  private async handleQAQuestion(socket: Socket, data: any): Promise<void> {
    try {
      const auth = (socket as any).auth;
      if (!auth) {
        socket.emit('error', { message: 'No autenticado' });
        return;
      }

      // Validar pregunta
      if (!data.question || data.question.trim().length === 0) {
        socket.emit('error', { message: 'Pregunta vacía' });
        return;
      }

      if (data.question.length > 300) {
        socket.emit('error', { message: 'Pregunta demasiado larga' });
        return;
      }

      // Obtener información del usuario
      const participant = await VirtualParticipant.findByPk(auth.participantId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!participant || !participant.canQA) {
        socket.emit('error', { message: 'No tienes permisos para hacer preguntas' });
        return;
      }

      // Crear pregunta Q&A
      const qaQuestion: QAQuestion = {
        id: `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId: auth.eventId,
        roomId: auth.roomId,
        userId: participant.userId,
        userName: participant.user?.fullName || 'Usuario',
        question: data.question.trim(),
        timestamp: new Date(),
        upvotes: 0,
        answered: false
      };

      // Actualizar actividad
      await virtualParticipantService.updateParticipantActivity(participant.id, {
        lastActivity: new Date()
      });

      // Broadcast de la pregunta
      const room = auth.roomId ? `room_${auth.roomId}` : `event_${auth.eventId}`;
      this.io.to(room).emit(SocketEventType.QA_QUESTION, qaQuestion);

      // Confirmar envío al remitente
      socket.emit('qa_question_sent', { questionId: qaQuestion.id });

      logger.info(`Q&A question sent: ${socket.id} in event ${auth.eventId}`);

    } catch (error) {
      logger.error('Error handling Q&A question:', error);
      socket.emit('error', { message: 'Error al enviar pregunta' });
    }
  }

  /**
   * Maneja votos en preguntas Q&A
   */
  private async handleQAUpvote(socket: Socket, data: any): Promise<void> {
    try {
      const auth = (socket as any).auth;
      if (!auth || !data.questionId) return;

      // Aquí iría la lógica para actualizar votos en la base de datos
      // Por ahora solo emitimos el evento

      const upvoteData = {
        questionId: data.questionId,
        userId: auth.userId,
        upvotes: data.upvotes || 1
      };

      const room = auth.roomId ? `room_${auth.roomId}` : `event_${auth.eventId}`;
      this.io.to(room).emit(SocketEventType.QA_QUESTION_UPVOTED, upvoteData);

    } catch (error) {
      logger.error('Error handling Q&A upvote:', error);
    }
  }

  /**
   * Maneja votos en encuestas
   */
  private async handlePollVote(socket: Socket, data: any): Promise<void> {
    try {
      const auth = (socket as any).auth;
      if (!auth || !data.pollId || !data.optionId) return;

      // Aquí iría la lógica para registrar el voto en la base de datos
      // Por ahora solo emitimos el evento

      const voteData = {
        pollId: data.pollId,
        optionId: data.optionId,
        userId: auth.userId,
        timestamp: new Date()
      };

      const room = auth.roomId ? `room_${auth.roomId}` : `event_${auth.eventId}`;
      this.io.to(room).emit(SocketEventType.POLL_VOTE, voteData);

    } catch (error) {
      logger.error('Error handling poll vote:', error);
    }
  }

  /**
   * Maneja desconexión de socket
   */
  private handleDisconnect(socket: Socket): void {
    logger.info(`Socket disconnected: ${socket.id}`);

    // Remover de registros
    this.connectedSockets.delete(socket.id);

    // Remover de salas de eventos
    for (const [eventId, sockets] of this.eventRooms.entries()) {
      sockets.delete(socket.id);
    }

    // Remover de sockets de participantes
    for (const [userId, sockets] of this.participantSockets.entries()) {
      sockets.delete(socket.id);
    }
  }

  // ====================================================================
  // MÉTODOS DE BROADCAST
  // ====================================================================

  /**
   * Envía mensaje a todos los sockets de un evento
   */
  broadcastToEvent(eventId: number, event: string, data: any): void {
    this.io.to(`event_${eventId}`).emit(event, data);
  }

  /**
   * Envía mensaje a todos los sockets de una sala
   */
  broadcastToRoom(roomId: number, event: string, data: any): void {
    this.io.to(`room_${roomId}`).emit(event, data);
  }

  /**
   * Envía mensaje a un socket específico
   */
  sendToSocket(socketId: string, event: string, data: any): void {
    const socket = this.connectedSockets.get(socketId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  /**
   * Envía mensaje a todos los sockets de un usuario
   */
  sendToUser(userId: number, event: string, data: any): void {
    const sockets = this.participantSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        this.sendToSocket(socketId, event, data);
      });
    }
  }

  // ====================================================================
  // MÉTODOS DE GESTIÓN DE SALAS
  // ====================================================================

  /**
   * Agrega socket a sala de evento
   */
  private addToEventRoom(eventId: number, socketId: string): void {
    if (!this.eventRooms.has(eventId)) {
      this.eventRooms.set(eventId, new Set());
    }
    this.eventRooms.get(eventId)!.add(socketId);
  }

  /**
   * Agrega socket a lista de sockets de participante
   */
  private addToParticipantSockets(userId: number, socketId: string): void {
    if (!this.participantSockets.has(userId)) {
      this.participantSockets.set(userId, new Set());
    }
    this.participantSockets.get(userId)!.add(socketId);
  }

  /**
   * Actualiza conteo de participantes
   */
  private async updateParticipantCount(eventId: number): Promise<void> {
    try {
      const stats = await virtualParticipantService.getVirtualParticipantsStats(eventId, undefined);
      if (stats.success) {
        this.broadcastToEvent(eventId, SocketEventType.PARTICIPANT_COUNT_UPDATE, {
          eventId,
          activeParticipants: stats.data.activeParticipants,
          totalParticipants: stats.data.totalParticipants
        });
      }
    } catch (error) {
      logger.error('Error updating participant count:', error);
    }
  }

  // ====================================================================
  // MÉTODOS DE MODERACIÓN
  // ====================================================================

  /**
   * Expulsa a un usuario de un evento
   */
  async kickUser(eventId: number, userId: number, reason?: string): Promise<void> {
    const sockets = this.participantSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        const socket = this.connectedSockets.get(socketId);
        if (socket) {
          socket.emit('kicked', { reason: reason || 'Expulsado por moderador' });
          socket.disconnect();
        }
      });
    }

    // Remover de registros
    this.participantSockets.delete(userId);
  }

  /**
   * Silencia a un usuario en chat
   */
  async muteUser(eventId: number, userId: number, duration?: number): Promise<void> {
    this.sendToUser(userId, SocketEventType.USER_MUTED, {
      eventId,
      duration,
      mutedAt: new Date()
    });

    this.broadcastToEvent(eventId, SocketEventType.USER_MUTED, {
      userId,
      duration,
      mutedAt: new Date()
    });
  }

  /**
   * Quita silencio a un usuario en chat
   */
  async unmuteUser(eventId: number, userId: number): Promise<void> {
    this.sendToUser(userId, SocketEventType.USER_UNMUTED, {
      eventId,
      unmutedAt: new Date()
    });

    this.broadcastToEvent(eventId, SocketEventType.USER_UNMUTED, {
      userId,
      unmutedAt: new Date()
    });
  }

  // ====================================================================
  // MÉTODOS DE NOTIFICACIONES
  // ====================================================================

  /**
   * Envía notificación a un evento
   */
  sendNotification(eventId: number, notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    data?: any;
  }): void {
    this.broadcastToEvent(eventId, SocketEventType.NOTIFICATION, {
      ...notification,
      timestamp: new Date()
    });
  }

  /**
   * Envía mensaje del sistema
   */
  sendSystemMessage(eventId: number, message: string, data?: any): void {
    this.broadcastToEvent(eventId, SocketEventType.SYSTEM_MESSAGE, {
      message,
      data,
      timestamp: new Date()
    });
  }

  // ====================================================================
  // MÉTODOS DE ESTADÍSTICAS
  // ====================================================================

  /**
   * Obtiene estadísticas de conexiones
   */
  getConnectionStats(): {
    totalConnections: number;
    eventRooms: number;
    participantSockets: number;
  } {
    return {
      totalConnections: this.connectedSockets.size,
      eventRooms: this.eventRooms.size,
      participantSockets: this.participantSockets.size
    };
  }

  /**
   * Obtiene conexiones activas por evento
   */
  getConnectionsByEvent(eventId: number): number {
    const sockets = this.eventRooms.get(eventId);
    return sockets ? sockets.size : 0;
  }
}

/**
 * Instancia singleton del servicio de sockets
 */
export let socketService: SocketService;

/**
 * Inicializa el servicio de sockets
 */
export const initializeSocketService = (httpServer: HTTPServer): void => {
  socketService = new SocketService(httpServer);
};