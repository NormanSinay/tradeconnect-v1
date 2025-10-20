import React from 'react'

interface FooterProps {
  onNavigate?: (page: string) => void
}

export const Footer: React.FC<FooterProps> = ({ onNavigate = () => {} }) => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-icon"></div>
            TradeConnect
          </div>
          <p>
            Plataforma e-commerce líder en gestión de eventos empresariales
            con facturación FEL automática para Guatemala.
          </p>
        </div>

        <div className="footer-section">
          <h4>Plataforma</h4>
          <ul>
            <li><a onClick={() => onNavigate('events')}>🎯 Eventos</a></li>
            <li><a onClick={() => onNavigate('courses')}>📚 Cursos</a></li>
            <li><a onClick={() => onNavigate('home')}>📂 Categorías</a></li>
            <li><a>💰 Precios</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Empresa</h4>
          <ul>
            <li><a>ℹ️ Nosotros</a></li>
            <li><a>📝 Blog</a></li>
            <li><a>💼 Carreras</a></li>
            <li><a>📧 Contacto</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Soporte</h4>
          <ul>
            <li><a>❓ Centro de Ayuda</a></li>
            <li><a>🔌 API Docs</a></li>
            <li><a>⚖️ Legal</a></li>
            <li><a>🔒 Privacidad</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 TradeConnect - Cámara de Comercio Guatemala 🇬🇹</p>
      </div>
    </footer>
  )
}

export default Footer