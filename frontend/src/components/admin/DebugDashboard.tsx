/**
 * @fileoverview DebugDashboard - Componente de diagnóstico para dashboard administrativo
 *
 * Arquitectura Recomendada:
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
 * @version 1.0.0
 * @author TradeConnect Team
 * @license MIT
 */

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            🔍 Dashboard de Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Estado de Autenticación:</h3>
              <p>isAuthenticated: {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Datos del Usuario:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">LocalStorage:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify({
                  user: localStorage.getItem('tradeconnect_user'),
                  token: localStorage.getItem('tradeconnect_auth_token') ? 'Existe' : 'No existe',
                  refreshToken: localStorage.getItem('tradeconnect_refresh_token') ? 'Existe' : 'No existe'
                }, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugDashboard;
