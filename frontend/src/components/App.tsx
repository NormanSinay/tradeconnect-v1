import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from '@/theme';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import AppRoutes from '@/components/AppRoutes';
import BaseLayout from '@/components/layout/BaseLayout';
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <CartProvider>
                <BaseLayout>
                  <AppRoutes />
                </BaseLayout>
                <ToastContainer />
              </CartProvider>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;