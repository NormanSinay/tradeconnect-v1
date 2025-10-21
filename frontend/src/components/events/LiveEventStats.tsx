import React, { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, DollarSign, Clock, TrendingUp } from 'lucide-react'
import type { LiveStatsPayload } from '@/types/websocket.types'

interface LiveEventStatsProps {
  eventId: string
  className?: string
}

export const LiveEventStats: React.FC<LiveEventStatsProps> = ({
  eventId,
  className
}) => {
  const { subscribe, joinEvent, leaveEvent, isConnected } = useWebSocket() || {}
  const [stats, setStats] = useState<LiveStatsPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && eventId && joinEvent && subscribe && leaveEvent) {
      joinEvent(eventId)

      const unsubscribe = subscribe('live_stats_updated', (data: LiveStatsPayload) => {
        if (data.eventId === eventId) {
          setStats(data)
          setIsLoading(false)
        }
      })

      return () => {
        // Cleanup function - unsubscribe and leave event
        leaveEvent(eventId)
      }
    }
    setIsLoading(false)
    return undefined
  }, [eventId, isConnected, joinEvent, leaveEvent, subscribe])

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Conectando a estadísticas en tiempo real...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const occupancyPercentage = stats.capacity > 0 ? (stats.attendeesCount / stats.capacity) * 100 : 0
  const isFull = occupancyPercentage >= 100
  const isAlmostFull = occupancyPercentage >= 80

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Estadísticas en Vivo
          <Badge variant="outline" className="ml-auto">
            Actualización en tiempo real
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Asistencia</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.attendeesCount} / {stats.capacity}
            </span>
          </div>
          <Progress
            value={occupancyPercentage}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(occupancyPercentage)}% ocupado</span>
            {isFull && <Badge variant="destructive" className="text-xs">Completo</Badge>}
            {isAlmostFull && !isFull && <Badge variant="secondary" className="text-xs">Casi lleno</Badge>}
          </div>
        </div>

        {/* Waitlist */}
        {stats.waitlistCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Lista de espera</span>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              {stats.waitlistCount} personas
            </Badge>
          </div>
        )}

        {/* Revenue */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Ingresos</span>
          </div>
          <span className="text-lg font-bold text-green-700">
            Q{stats.revenue.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Real-time indicator */}
        <div className="flex items-center justify-center pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Actualización en tiempo real</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LiveEventStats