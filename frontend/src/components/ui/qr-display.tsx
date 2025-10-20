import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface QRData {
  id: number
  registrationId: number
  qrHash: string
  qrCode: string
  status: string
  expiresAt?: string
  generatedAt: string
  event?: {
    id: number
    title: string
    startDate: string
    endDate: string
  }
  registration?: {
    id: number
    user?: {
      firstName: string
      lastName: string
    }
  }
}

interface QRDisplayProps {
  registrationId?: number
  onDownload?: () => void
  onShare?: () => void
}

export const QRDisplay: React.FC<QRDisplayProps> = ({
  registrationId = 1,
  onDownload = () => {},
  onShare = () => {}
}) => {
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQRData()
  }, [registrationId])

  const fetchQRData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/qr/${registrationId}`)

      if (response.data.success) {
        setQrData((response.data.data as any).qr)
      } else {
        setError('Error al cargar el código QR')
      }
    } catch (err) {
      console.error('Error fetching QR:', err)
      setError('Error al cargar el código QR')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getParticipantName = () => {
    if (!qrData?.registration?.user) return 'Participante'
    return `${qrData.registration.user.firstName} ${qrData.registration.user.lastName}`
  }

  if (loading) {
    return (
      <div className="qr-container">
        <div className="qr-card">
          <h2 className="qr-title">Código de Acceso QR</h2>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Cargando código QR...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !qrData) {
    return (
      <div className="qr-container">
        <div className="qr-card">
          <h2 className="qr-title">Código de Acceso QR</h2>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <p>{error || 'Código QR no encontrado'}</p>
            <button
              className="btn-primary"
              onClick={fetchQRData}
              style={{ marginTop: '1rem' }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="qr-container">
      <div className="qr-card">
        <h2 className="qr-title">Código de Acceso QR</h2>
        <div className="qr-event-name">{qrData.event?.title || 'Evento'}</div>

        <div className="qr-code-display">
          {qrData.qrCode ? (
            <img
              src={qrData.qrCode}
              alt="Código QR"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <rect width="100" height="100" fill="white"/>
              <rect x="10" y="10" width="30" height="30" fill="black"/>
              <rect x="60" y="10" width="30" height="30" fill="black"/>
              <rect x="10" y="60" width="30" height="30" fill="black"/>
              <rect x="15" y="15" width="20" height="20" fill="white"/>
              <rect x="65" y="15" width="20" height="20" fill="white"/>
              <rect x="15" y="65" width="20" height="20" fill="white"/>
              <rect x="50" y="50" width="10" height="10" fill="black"/>
              <rect x="70" y="70" width="10" height="10" fill="black"/>
              <rect x="45" y="25" width="5" height="5" fill="black"/>
            </svg>
          )}
        </div>

        <div className="qr-info">
          <div className="qr-info-row">
            <span style={{ color: 'var(--text-light)' }}>Participante:</span>
            <span style={{ fontWeight: 700 }}>{getParticipantName()}</span>
          </div>
          <div className="qr-info-row">
            <span style={{ color: 'var(--text-light)' }}>Tipo de Entrada:</span>
            <span style={{ fontWeight: 700 }}>General</span>
          </div>
          <div className="qr-info-row">
            <span style={{ color: 'var(--text-light)' }}>Fecha del Evento:</span>
            <span style={{ fontWeight: 700 }}>
              {qrData.event?.startDate ? formatDate(qrData.event.startDate) : 'Por confirmar'}
            </span>
          </div>
          <div className="qr-info-row">
            <span style={{ color: 'var(--text-light)' }}>Verificación:</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>✓ Blockchain</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={onDownload} style={{ flex: 1 }}>
            📥 Descargar QR
          </button>
          <button className="btn-secondary" onClick={onShare} style={{ flex: 1 }}>
            📧 Enviar por Email
          </button>
        </div>

        <div className="qr-warning">
          <div className="qr-warning-title">⚠️ Importante</div>
          <div className="qr-warning-text">
            Este código QR es único e intransferible. Preséntalo en tu dispositivo móvil
            o impreso al momento del registro en el evento.
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRDisplay