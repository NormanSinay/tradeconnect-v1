import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import { securityUtils } from '@/utils/security';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary - Componente que captura errores en el árbol de componentes
 * Migrado de MUI a Tailwind CSS + shadcn/ui
 */
class ErrorBoundaryNew extends Component<Props, State> {
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <Card className="max-w-2xl w-full shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <FaExclamationTriangle className="text-6xl text-error" />
              </div>
              <CardTitle className="text-3xl text-error">
                ¡Ups! Algo salió mal
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-center text-gray-600 text-base">
                Ha ocurrido un error inesperado. Nuestros desarrolladores han sido notificados
                y estamos trabajando para solucionarlo.
              </p>

              {this.state.error && (
                <Alert variant="destructive" className="bg-warning/10 border-warning text-warning-foreground">
                  <AlertTitle className="font-semibold">Error técnico:</AlertTitle>
                  <AlertDescription className="mt-1">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 justify-center flex-wrap pt-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <FaRedo className="h-4 w-4" />
                  Intentar de nuevo
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={this.handleReportError}
                >
                  Reportar error
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => window.location.href = '/'}
                  className="gap-2"
                >
                  <FaHome className="h-4 w-4" />
                  Ir al inicio
                </Button>
              </div>

              {import.meta.env.DEV && this.state.errorInfo && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    Detalles técnicos (desarrollo):
                  </h3>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-auto max-h-[200px]">
                        {this.state.error?.stack}
                        {'\n\nComponent Stack:\n'}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryNew;
