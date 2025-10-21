import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ComponentProps } from '@/types'
import type {
  LineChartData,
  BarChartData,
  PieChartData,
  ChartConfig,
} from '@/types/admin'

interface ChartWrapperProps extends ComponentProps {
  title: string
  type: 'line' | 'bar' | 'pie'
  data: LineChartData | BarChartData | PieChartData
  config?: ChartConfig
  isLoading?: boolean
  height?: number
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
]

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  type,
  data,
  config,
  isLoading = false,
  height = 300,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="bg-gray-200 rounded-lg"
            style={{ height }}
          />
        </CardContent>
      </Card>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        const lineData = data as LineChartData
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={lineData.labels.map((label, index) => ({
              name: label,
              ...lineData.datasets.reduce((acc, dataset) => ({
                ...acc,
                [dataset.label]: dataset.data[index],
              }), {}),
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {config?.showLegend !== false && <Legend />}
              {lineData.datasets.map((dataset, index) => (
                <Line
                  key={dataset.label}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={dataset.borderColor || COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        const barData = data as BarChartData
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={barData.labels.map((label, index) => ({
              name: label,
              ...barData.datasets.reduce((acc, dataset) => ({
                ...acc,
                [dataset.label]: dataset.data[index],
              }), {}),
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {config?.showLegend !== false && <Legend />}
              {barData.datasets.map((dataset, index) => (
                <Bar
                  key={dataset.label}
                  dataKey={dataset.label}
                  fill={dataset.backgroundColor?.[0] || COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = data as PieChartData
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData.labels.map((label, index) => ({
                  name: label,
                  value: pieData.datasets[0]?.data[index] || 0,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.labels.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieData.datasets[0]?.backgroundColor?.[index] || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              {config?.showLegend !== false && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Tipo de gráfico no soportado</div>
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}