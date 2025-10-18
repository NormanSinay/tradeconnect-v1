import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarNew from './NavbarNew';
import FooterNew from './FooterNew';
import VoiceAssistant from './VoiceAssistant';
import { Toaster } from 'react-hot-toast';

interface BaseLayoutProps {
  children?: React.ReactNode;
}

const BaseLayoutNew: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <NavbarNew />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <FooterNew />

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

export default BaseLayoutNew;
