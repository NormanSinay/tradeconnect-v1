import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProfilePage from './profile-page'

export const ProfilePageWrapper: React.FC = () => {
  const navigate = useNavigate()

  const handleViewQR = (eventId: number) => {
    navigate(`/qr/${eventId}`)
  }

  const handleViewCertificate = (registrationId: number) => {
    navigate(`/certificate/${registrationId}`)
  }

  return (
    <div id="profilePage" className="page-container active">
      <ProfilePage
        onViewQR={handleViewQR}
        onViewCertificate={handleViewCertificate}
      />
    </div>
  )
}

export default ProfilePageWrapper