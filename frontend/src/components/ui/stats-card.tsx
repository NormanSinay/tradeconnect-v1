import React from 'react'
import { motion } from 'framer-motion'
import { IconType } from 'react-icons'

interface StatsCardProps {
  title: string
  value: string | number
  icon: IconType
  color?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'bg-[#6B1E22]',
  trend,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{value}</p>

          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard