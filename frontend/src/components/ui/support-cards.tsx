import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface SupportCard {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  action: {
    type: 'link' | 'button'
    href?: string
    onClick?: () => void
    text: string
  }
}

interface SupportCardsProps {
  cards: SupportCard[]
  className?: string
}

const SupportCards: React.FC<SupportCardsProps> = ({ cards, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6 text-center border border-gray-100 hover:border-[#6B1E22] group"
        >
          <div className="text-4xl text-[#6B1E22] mb-4 group-hover:scale-110 transition-transform duration-300">
            {card.icon}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {card.title}
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {card.description}
          </p>

          {card.action.type === 'link' ? (
            <a
              href={card.action.href}
              className="inline-block bg-[#6B1E22] text-white px-4 py-2 rounded-lg hover:bg-[#8a2b30] transition-colors duration-200 text-sm font-medium"
            >
              {card.action.text}
            </a>
          ) : (
            <Button
              onClick={card.action.onClick}
              className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
            >
              {card.action.text}
            </Button>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default SupportCards