import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

const DebugDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔍 Dashboard de Diagnóstico
        </Typography>

        <Box component={"div" as any} sx={{ mt: 3 }}>
          <Typography variant="h6">Estado de Autenticación:</Typography>
          <Typography>isAuthenticated: {isAuthenticated ? '✅ Sí' : '❌ No'}</Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>Datos del Usuario:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>

          <Typography variant="h6" sx={{ mt: 2 }}>LocalStorage:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify({
              user: localStorage.getItem('tradeconnect_user'),
              token: localStorage.getItem('tradeconnect_auth_token') ? 'Existe' : 'No existe',
              refreshToken: localStorage.getItem('tradeconnect_refresh_token') ? 'Existe' : 'No existe'
            }, null, 2)}
          </pre>
        </Box>
      </Paper>
    </Container>
  );
};

export default DebugDashboard;
