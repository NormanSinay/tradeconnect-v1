import React from 'react'
import { FaUsers, FaCalendarAlt, FaMoneyBillWave, FaChartLine } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ComponentProps } from '@/types'

interface DashboardChartsProps extends ComponentProps {
  stats: {
    totalUsers: number
    totalEvents: number
    totalRevenue: number
    monthlyGrowth: number
  }
  chartData?: any[] // This would be for actual chart data
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  stats,
  chartData,
  className,
}) => {
  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsers.toLocaleString(),
      icon: FaUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Eventos Activos',
      value: stats.totalEvents.toString(),
      icon: FaCalendarAlt,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Ingresos Totales',
      value: `Q${stats.totalRevenue.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: 'Crecimiento Mensual',
      value: `${stats.monthlyGrowth}%`,
      icon: FaChartLine,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+5%',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className={className}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <Badge
                        variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">
                        vs mes anterior
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <FaChartLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico de ingresos</p>
                <p className="text-sm text-gray-400 mt-1">
                  Se implementará con Recharts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico de eventos</p>
                <p className="text-sm text-gray-400 mt-1">
                  Se implementará con Recharts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico de usuarios</p>
                <p className="text-sm text-gray-400 mt-1">
                  Se implementará con Recharts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nuevo usuario registrado</p>
                  <p className="text-xs text-gray-500">Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Evento creado</p>
                  <p className="text-xs text-gray-500">Hace 12 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pago procesado</p>
                  <p className="text-xs text-gray-500">Hace 1 hora</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reporte generado</p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}