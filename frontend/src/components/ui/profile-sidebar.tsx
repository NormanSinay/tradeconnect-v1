import React from 'react'

interface ProfileSidebarProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user = {
    name: 'Juan Pérez',
    email: 'juan@email.com'
  },
  activeSection = 'events',
  onSectionChange = () => {}
}) => {
  const menuItems = [
    { id: 'events', label: 'Mis Eventos', icon: '🎯' },
    { id: 'courses', label: 'Mis Cursos', icon: '📚' },
    { id: 'certificates', label: 'Certificados', icon: '🎓' },
    { id: 'invoices', label: 'Facturas FEL', icon: '📄' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ]

  return (
    <div className="profile-sidebar">
      <div className="profile-avatar">
        👤
      </div>
      <div className="profile-name">{user.name}</div>
      <div className="profile-email">{user.email}</div>

      <ul className="profile-menu">
        {menuItems.map(item => (
          <li key={item.id}>
            <button
              className={`profile-menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProfileSidebar