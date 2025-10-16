import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Error, Refresh } from '@mui/icons-material';
import { securityUtils } from '@/utils/security';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Report error securely
    securityUtils.errorReporter.reportError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleReportError = () => {
    if (this.state.error) {
      securityUtils.errorReporter.reportError(this.state.error, {
        userReported: true,
        componentStack: this.state.errorInfo?.componentStack,
      });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          component={"div" as any}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
            }}
            elevation={3}
          >
            <Error
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />

            <Typography variant="h4" gutterBottom color="error">
              ¡Ups! Algo salió mal
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Ha ocurrido un error inesperado. Nuestros desarrolladores han sido notificados
              y estamos trabajando para solucionarlo.
            </Typography>

            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Error técnico:</strong> {this.state.error?.message}
              </Typography>
            </Alert>

            <Box component={"div" as any} sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                size="large"
              >
                Intentar de nuevo
              </Button>

              <Button
                variant="outlined"
                onClick={this.handleReportError}
                size="large"
              >
                Reportar error
              </Button>

              <Button
                variant="text"
                onClick={() => window.location.href = '/'}
                size="large"
              >
                Ir al inicio
              </Button>
            </Box>

            {import.meta.env.DEV && this.state.errorInfo && (
              <Box component={"div" as any} sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Detalles técnicos (desarrollo):
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {this.state.error?.stack}
                    {'\n\nComponent Stack:\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;