import React from 'react'
import { useParams } from 'react-router-dom'
import CertificateCard from './certificate-card'

export const CertificatePageWrapper: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>()

  const registrationIdNum = registrationId ? parseInt(registrationId, 10) : 1

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download certificate for registration:', registrationIdNum)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share certificate for registration:', registrationIdNum)
  }

  const handleVerify = () => {
    // TODO: Implement verification functionality
    console.log('Verify certificate for registration:', registrationIdNum)
  }

  return (
    <div id="certificatePage" className="page-container active">
      <CertificateCard
        registrationId={registrationIdNum}
        onDownload={handleDownload}
        onShare={handleShare}
        onVerify={handleVerify}
      />
    </div>
  )
}

export default CertificatePageWrapper