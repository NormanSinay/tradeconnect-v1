import React, { useState } from 'react'
import ProfileSidebar from './profile-sidebar'
import ProfileContent from './profile-content'

interface ProfilePageProps {
  onViewQR?: (eventId: number) => void
  onViewCertificate?: (eventId: number) => void
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onViewQR = () => {},
  onViewCertificate = () => {}
}) => {
  const [activeSection, setActiveSection] = useState('events')

  return (
    <div className="profile-container">
      <div className="profile-grid">
        <ProfileSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <ProfileContent
          activeSection={activeSection}
          onViewQR={onViewQR}
          onViewCertificate={onViewCertificate}
        />
      </div>
    </div>
  )
}

export default ProfilePage