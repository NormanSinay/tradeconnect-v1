/**
 * @fileoverview websocketService.ts - Servicio de WebSocket para TradeConnect
 * @description Servicio que maneja conexiones WebSocket para actualizaciones en tiempo real de eventos, notificaciones y pagos.
 *
 * Arquitectura recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @author TradeConnect Team
 * @version 1.0.0
 */
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/utils/constants';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event listeners
  private listeners: { [event: string]: ((data: any) => void)[] } = {};

  connect(token?: string): void {
    if (this.socket?.connected) return;

    const socketUrl = API_BASE_URL.replace('/api/v1', '');

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Listen for all events and forward to registered listeners
    this.socket.onAny((event, data) => {
      this.notifyListeners(event, data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
    }
  }

  // Register event listener
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  off(event: string, callback?: (data: any) => void): void {
    if (!this.listeners[event]) return;

    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      delete this.listeners[event];
    }
  }

  // Emit event to server
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  }

  // Notify registered listeners
  private notifyListeners(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Join room (for event-specific updates)
  joinRoom(room: string): void {
    this.emit('join_room', { room });
  }

  // Leave room
  leaveRoom(room: string): void {
    this.emit('leave_room', { room });
  }

  // Event-specific methods
  onEventUpdate(callback: (data: any) => void): void {
    this.on('event_updated', callback);
  }

  onRegistrationUpdate(callback: (data: any) => void): void {
    this.on('registration_updated', callback);
  }

  onPaymentUpdate(callback: (data: any) => void): void {
    this.on('payment_updated', callback);
  }

  onNotification(callback: (data: any) => void): void {
    this.on('notification', callback);
  }
}

export const websocketService = new WebSocketService();
export default websocketService;