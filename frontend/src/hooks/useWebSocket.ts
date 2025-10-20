import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import websocketService from '@/services/websocketService';
import { STORAGE_KEYS } from '@/utils/constants';

// WebSocket hooks for React/Astro architecture
// Compatible with: React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui → Tailwind CSS → Radix UI → React Icons

export const useWebSocket = () => {
  const { user } = useAuth();
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // SSR-safe: only connect on client-side
    if (typeof window === 'undefined') return;

    if (user && !isConnectedRef.current) {
      // Get token from localStorage
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        websocketService.connect(token);
        isConnectedRef.current = true;
      }
    }

    return () => {
      if (isConnectedRef.current) {
        websocketService.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, [user]);

  return {
    isConnected: websocketService.isConnected(),
    joinRoom: websocketService.joinRoom.bind(websocketService),
    leaveRoom: websocketService.leaveRoom.bind(websocketService),
    onEventUpdate: websocketService.onEventUpdate.bind(websocketService),
    onRegistrationUpdate: websocketService.onRegistrationUpdate.bind(websocketService),
    onPaymentUpdate: websocketService.onPaymentUpdate.bind(websocketService),
    onNotification: websocketService.onNotification.bind(websocketService),
    emit: websocketService.emit.bind(websocketService),
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
  };
};