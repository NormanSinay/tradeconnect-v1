import React from 'react'

interface StatItem {
  number: string
  label: string
  emoji: string
}

interface StatsSectionProps {
  stats?: StatItem[]
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats = [
    { number: '150+', label: 'Eventos Anuales', emoji: '🎯' },
    { number: '5,000+', label: 'Participantes', emoji: '👥' },
    { number: '100%', label: 'FEL Certificado', emoji: '✅' },
    { number: '24/7', label: 'Soporte', emoji: '🛡️' }
  ]
}) => {
  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.emoji} {stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StatsSection