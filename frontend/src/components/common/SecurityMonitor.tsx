import React, { useState, useEffect } from 'react'
import { useSecurity } from '@/hooks/useSecurity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield, Eye, Trash2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SecurityMonitorProps {
  className?: string
  showOnlyCritical?: boolean
  maxEvents?: number
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({
  className,
  showOnlyCritical = false,
  maxEvents = 50
}) => {
  const {
    securityEvents,
    suspiciousActivityCount,
    clearSecurityEvents,
    isRateLimited,
    getRateLimitStatus
  } = useSecurity()

  const [isExpanded, setIsExpanded] = useState(false)

  const filteredEvents = showOnlyCritical
    ? securityEvents.filter(event => event.severity === 'critical' || event.severity === 'high')
    : securityEvents

  const recentEvents = filteredEvents.slice(0, maxEvents)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-3 w-3" />
      case 'high': return <AlertTriangle className="h-3 w-3" />
      case 'medium': return <Eye className="h-3 w-3" />
      case 'low': return <Shield className="h-3 w-3" />
      default: return <Shield className="h-3 w-3" />
    }
  }

  const rateLimitStatus = getRateLimitStatus('api')
  const hasRateLimitIssues = isRateLimited('api')

  if (securityEvents.length === 0 && suspiciousActivityCount === 0 && !hasRateLimitIssues) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Monitor de Seguridad
            {suspiciousActivityCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {suspiciousActivityCount} actividades sospechosas
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Contraer' : 'Expandir'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSecurityEvents}
              disabled={securityEvents.length === 0}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rate Limiting Status */}
        {hasRateLimitIssues && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Límite de tasa excedido
              </span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Quedan {rateLimitStatus.remaining} solicitudes permitidas
            </p>
          </div>
        )}

        {/* Security Events */}
        {recentEvents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Eventos de Seguridad ({recentEvents.length})
              </h4>
              {filteredEvents.length > maxEvents && (
                <Badge variant="outline" className="text-xs">
                  +{filteredEvents.length - maxEvents} más
                </Badge>
              )}
            </div>

            {isExpanded ? (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {recentEvents.map((event, index) => (
                  <div
                    key={`${event.timestamp.getTime()}-${index}`}
                    className="p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={`p-1 rounded ${getSeverityColor(event.severity)}`}>
                          {getSeverityIcon(event.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(event.timestamp, {
                              addSuffix: true,
                              locale: es
                            })}
                          </p>
                          {event.details && (
                            <details className="mt-1">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                Ver detalles
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                                {JSON.stringify(event.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getSeverityColor(event.severity)}`}
                      >
                        {event.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {['critical', 'high', 'medium', 'low'].map(severity => {
                  const count = recentEvents.filter(e => e.severity === severity).length
                  return count > 0 ? (
                    <div key={severity} className="flex items-center gap-2">
                      <div className={`p-1 rounded ${getSeverityColor(severity)}`}>
                        {getSeverityIcon(severity)}
                      </div>
                      <span className="text-xs">
                        {severity}: {count}
                      </span>
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Eventos monitoreados: {securityEvents.length}
            </span>
            <span>
              Última actualización: {formatDistanceToNow(new Date(), {
                addSuffix: true,
                locale: es
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SecurityMonitor