/**
 * @fileoverview BaseLayout - Layout base para páginas públicas
 * @description Proporciona estructura básica con navbar, footer y componentes comunes
 *
 * Arquitectura:
 * - React (componentes interactivos) → Estado de navegación, outlet para rutas
 * - Astro (routing y SSR) → Compatible con SSR, navegación del lado cliente
 * - shadcn/ui (componentes UI) → No aplica directamente (usa componentes personalizados)
 * - Tailwind CSS (estilos) → Estilos utilitarios para layout
 * - Radix UI (primitivos accesibles) → No aplica directamente
 * - Lucide Icons (iconos) → No aplica directamente
 *
 * @version 2.0.0
 * @since 2024
 * @author TradeConnect Team
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import VoiceAssistant from './VoiceAssistant';
import { Toaster } from 'react-hot-toast';

interface BaseLayoutProps {
  children?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Voice Assistant */}
      <VoiceAssistant />

      {/* Toast Notifications */}
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
    </div>
  );
};

export default BaseLayout;