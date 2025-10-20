/**
 * @fileoverview Client App component for TradeConnect Frontend
 * @description


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

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import AppRoutes from '@/components/AppRoutes';
import BaseLayout from '@/components/layout/BaseLayout';
import '@/styles/globals.css';
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

const ClientApp: React.FC = () => {
  // Hide the loader when React mounts
  React.useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <CartProvider>
            <BaseLayout>
              <AppRoutes />
            </BaseLayout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default ClientApp;
