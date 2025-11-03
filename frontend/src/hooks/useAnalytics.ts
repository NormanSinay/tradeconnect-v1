import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string | number;
  userRole?: string;
  timestamp: string;
  sessionId: string;
  page: string;
  metadata?: Record<string, any>;
}

interface UseAnalyticsReturn {
  trackEvent: (event: Omit<AnalyticsEvent, 'userId' | 'userRole' | 'timestamp' | 'sessionId'>) => void;
  trackPageView: (page: string, metadata?: Record<string, any>) => void;
  trackUserAction: (action: string, category: string, label?: string, value?: number) => void;
  trackDashboardInteraction: (dashboard: string, action: string, metadata?: Record<string, any>) => void;
}

/**
 * Hook personalizado para tracking de analytics
 * Centraliza el envío de eventos de analítica a diferentes proveedores
 */
export const useAnalytics = (): UseAnalyticsReturn => {
  const { user } = useAuthStore();

  // Generar session ID único
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Enviar evento a analytics (puede ser Google Analytics, Mixpanel, etc.)
  const sendToAnalytics = useCallback(async (eventData: AnalyticsEvent) => {
    try {
      // En desarrollo, solo loggear
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', eventData);
        return;
      }

      // En producción, enviar a servicio de analytics
      // Ejemplo: Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventData.action, {
          event_category: eventData.category,
          event_label: eventData.label,
          value: eventData.value,
          custom_user_id: eventData.userId,
          custom_user_role: eventData.userRole,
          custom_page: eventData.page,
          custom_metadata: JSON.stringify(eventData.metadata)
        });
      }

      // También enviar a backend para análisis interno
      await fetch('/api/v1/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        credentials: 'include',
      }).catch(() => {
        // Silenciar errores de analytics para no afectar UX
      });

    } catch (error) {
      // Silenciar errores de analytics
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  // Track evento genérico
  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'userId' | 'userRole' | 'timestamp' | 'sessionId'>) => {
    const eventData: AnalyticsEvent = {
      ...event,
      userId: user?.id,
      userRole: user?.role,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    };

    sendToAnalytics(eventData);
  }, [user, getSessionId, sendToAnalytics]);

  // Track vista de página
  const trackPageView = useCallback((page: string, metadata?: Record<string, any>) => {
    trackEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: page,
      page,
      metadata
    });
  }, [trackEvent]);

  // Track acción de usuario
  const trackUserAction = useCallback((action: string, category: string, label?: string, value?: number) => {
    trackEvent({
      event: 'user_action',
      category,
      action,
      label,
      value,
      page: window.location.pathname,
      metadata: { referrer: document.referrer }
    });
  }, [trackEvent]);

  // Track interacciones específicas del dashboard
  const trackDashboardInteraction = useCallback((dashboard: string, action: string, metadata?: Record<string, any>) => {
    trackEvent({
      event: 'dashboard_interaction',
      category: 'dashboard',
      action: `${dashboard}_${action}`,
      label: dashboard,
      page: window.location.pathname,
      metadata: {
        dashboard,
        action,
        ...metadata
      }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackDashboardInteraction
  };
};