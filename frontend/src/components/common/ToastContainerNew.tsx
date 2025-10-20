/**
 * @fileoverview ToastContainerNew - Contenedor moderno de notificaciones toast
 * @description Componente React para mostrar notificaciones toast con Tailwind CSS
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Notificaciones toast con estilos Tailwind
 * - Configuración completa de apariencia
 * - Compatibilidad SSR con Astro
 * - Posicionamiento inteligente
 * - Animaciones suaves
 *
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * ToastContainerNew - Contenedor moderno de notificaciones toast
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
const ToastContainerNew: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000, // 3 segundos por defecto
        style: {
          background: '#ffffff',
          color: '#1f2937', // gray-800
          border: '1px solid #e5e7eb', // gray-200
          borderRadius: '0.5rem', // rounded-lg
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // shadow-lg
          fontFamily: 'Inter, Roboto, system-ui, sans-serif',
          fontSize: '0.875rem', // text-sm
          padding: '1rem',
        },
        success: {
          duration: 3000, // 3 segundos para mensajes de éxito
          style: {
            background: '#10b981', // green-500
            color: '#ffffff',
            border: '1px solid #059669', // green-600
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10b981',
          },
          icon: '✅',
        },
        error: {
          duration: 4000, // 4 segundos para errores
          style: {
            background: '#ef4444', // red-500
            color: '#ffffff',
            border: '1px solid #dc2626', // red-600
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#ef4444',
          },
          icon: '❌',
        },
        loading: {
          style: {
            background: '#3b82f6', // blue-500
            color: '#ffffff',
            border: '1px solid #2563eb', // blue-600
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#3b82f6',
          },
        },
        // Custom toast variants (pueden usarse con toast.custom)
        blank: {
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
        },
      }}
      // Configuraciones adicionales
      containerStyle={{
        top: 80, // Debajo del navbar sticky
      }}
      // Clases para las transiciones
      containerClassName="toast-container"
      // Toasts con fondo transparente para glassmorphism (opcional)
      // gutter={8}
    />
  );
};

export default ToastContainerNew;
