import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backTo?: string
  actions?: React.ReactNode
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backTo = '/dashboard',
  actions
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link to={backTo}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-[#6B1E22] border-gray-300"
              >
                <FaArrowLeft />
                Volver
              </Button>
            </Link>
          )}

          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 text-sm lg:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DashboardHeader