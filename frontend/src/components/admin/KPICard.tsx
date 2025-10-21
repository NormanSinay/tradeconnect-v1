import React from 'react'
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ComponentProps } from '@/types'
import type { DashboardKPI } from '@/types/admin'

interface KPICardProps extends ComponentProps {
  kpi: DashboardKPI
  isLoading?: boolean
}

export const KPICard: React.FC<KPICardProps> = ({
  kpi,
  isLoading = false,
  className,
}) => {
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <FaArrowUp className="h-3 w-3" />
      case 'decrease':
        return <FaArrowDown className="h-3 w-3" />
      default:
        return <FaMinus className="h-3 w-3" />
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 bg-green-50'
      case 'decrease':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatValue = (value: number | string, format: string) => {
    if (typeof value === 'string') return value

    switch (format) {
      case 'currency':
        return `Q${value.toLocaleString()}`
      case 'percentage':
        return `${value}%`
      case 'number':
      default:
        return value.toLocaleString()
    }
  }

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {kpi.title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {formatValue(kpi.value, kpi.format)}
            </p>

            {kpi.change !== undefined && (
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs flex items-center space-x-1",
                    getChangeColor(kpi.changeType)
                  )}
                >
                  {getChangeIcon(kpi.changeType)}
                  <span>{Math.abs(kpi.change)}%</span>
                </Badge>
                <span className="text-xs text-gray-500">
                  vs período anterior
                </span>
              </div>
            )}
          </div>

          {kpi.icon && (
            <div className="ml-4">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{kpi.icon}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}