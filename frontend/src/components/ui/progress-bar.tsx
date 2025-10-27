import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showPercentage?: boolean
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = false,
  color = 'bg-[#6B1E22]',
  size = 'md'
}) => {
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]} ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full ${color} rounded-full relative`}
      >
        {showPercentage && progress > 10 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ProgressBar