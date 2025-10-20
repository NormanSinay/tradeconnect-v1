/**
 * @fileoverview Main App component for TradeConnect Frontend
 * @description

Arquitectura recomendada si migras:
  React (componentes interactivos)
    ↓
  Astro (routing y SSR)
    ↓
  shadcn/ui (componentes UI)
    ↓
  Tailwind CSS (estilos)
    ↓
  Radix UI (primitivos accesibles)
    ↓
  React Icons (iconos)

 * @architecture
 * - React: Componentes interactivos con hooks y context
 * - Astro: Routing y Server-Side Rendering (SSR)
 * - shadcn/ui: Componentes UI preconstruidos
 * - Tailwind CSS: Sistema de estilos utilitarios
 * - Radix UI: Primitivos accesibles para componentes
 * - React Icons: Biblioteca de iconos
 *
 * @compatibility SSR: Compatible con Astro SSR
 * @compatibility React: Compatible con React 18+
 * @compatibility TypeScript: Tipos completos incluidos
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import AppRoutes from '@/components/AppRoutes';
import ToastContainer from '@/components/common/ToastContainer';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import {
  performanceUtils,
  registerServiceWorker,
  preloadCriticalResources,
  cacheUtils
} from '@/utils/performance';
import { securityUtils } from '@/utils/security';
import '@/theme/global.css';
import '@/i18n';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    performanceUtils.measureCoreWebVitals();

    // Register service worker for PWA
    registerServiceWorker();

    // Preload critical resources
    preloadCriticalResources();

    // Clear cache on app start (optional)
    cacheUtils.clear();

    // Initialize security measures
    securityUtils.sessionManager.startInactivityTimer(
      15 * 60 * 1000, // 15 minutes
      () => {
        // Auto-logout callback
        console.log('Session expired due to inactivity');
        // Implement logout logic here
      }
    );

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
              <ToastContainer />
            </CartProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;