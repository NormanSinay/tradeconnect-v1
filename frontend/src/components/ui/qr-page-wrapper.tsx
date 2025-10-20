import React from 'react'
import { useParams } from 'react-router-dom'
import QRDisplay from './qr-display'

export const QRPageWrapper: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>()

  const registrationIdNum = registrationId ? parseInt(registrationId, 10) : 1

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download QR for registration:', registrationIdNum)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share QR for registration:', registrationIdNum)
  }

  return (
    <div id="qrPage" className="page-container active">
      <QRDisplay
        registrationId={registrationIdNum}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  )
}

export default QRPageWrapper