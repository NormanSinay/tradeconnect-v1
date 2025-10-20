import React from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

interface RealTimeIndicatorProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  className,
  showText = true,
  size = 'md'
}) => {
  const { isConnected, isConnecting, connectionState } = useWebSocket()

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'En línea',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'connecting':
      case 'reconnecting':
        return {
          icon: Loader2,
          text: 'Conectando...',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'error':
        return {
          icon: WifiOff,
          text: 'Error de conexión',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          icon: WifiOff,
          text: 'Desconectado',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const Icon = statusConfig.icon

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Badge
      variant={statusConfig.variant}
      className={cn(
        'flex items-center gap-1.5 transition-colors duration-200',
        statusConfig.className,
        className
      )}
    >
      <Icon
        className={cn(
          sizeClasses[size],
          connectionState === 'connecting' || connectionState === 'reconnecting' ? 'animate-spin' : ''
        )}
      />
      {showText && (
        <span className="text-xs font-medium">
          {statusConfig.text}
        </span>
      )}
    </Badge>
  )
}

export default RealTimeIndicator