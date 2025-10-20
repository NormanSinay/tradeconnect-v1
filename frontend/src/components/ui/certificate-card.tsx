import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface Certificate {
  id: number
  registrationId: number
  certificateHash: string
  blockchainHash?: string
  status: 'active' | 'revoked'
  issuedAt: string
  event?: {
    id: number
    title: string
    startDate: string
    endDate: string
    isVirtual: boolean
  }
  registration?: {
    id: number
    user?: {
      firstName: string
      lastName: string
    }
  }
}

interface CertificateCardProps {
  registrationId?: number
  onDownload?: () => void
  onShare?: () => void
  onVerify?: () => void
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  registrationId = 1,
  onDownload = () => {},
  onShare = () => {},
  onVerify = () => {}
}) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificate()
  }, [registrationId])

  const fetchCertificate = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/certificates/registrations/${registrationId}`)

      if (response.data.success) {
        setCertificate((response.data.data as any).certificate)
      } else {
        setError('Error al cargar el certificado')
      }
    } catch (err) {
      console.error('Error fetching certificate:', err)
      setError('Error al cargar el certificado')
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

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
    return `${diffHours} horas`
  }

  const getRecipientName = () => {
    if (!certificate?.registration?.user) return 'Participante'
    return `${certificate.registration.user.firstName} ${certificate.registration.user.lastName}`
  }

  if (loading) {
    return (
      <div className="certificate-container">
        <div className="certificate-card">
          <div className="certificate-logo">🏆</div>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Cargando certificado...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="certificate-container">
        <div className="certificate-card">
          <div className="certificate-logo">🏆</div>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <p>{error || 'Certificado no encontrado'}</p>
            <button
              className="btn-primary"
              onClick={fetchCertificate}
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
    <div className="certificate-container">
      <div className="certificate-card">
        <div className="certificate-logo">🏆</div>

        <h1 className="certificate-title">CERTIFICADO DE PARTICIPACIÓN</h1>
        <p className="certificate-subtitle">Cámara de Comercio de Guatemala</p>

        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          Se otorga el presente certificado a:
        </p>

        <h2 className="certificate-recipient">{getRecipientName()}</h2>

        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          Por su participación en el evento:
        </p>

        <h3 className="certificate-event">{certificate.event?.title || 'Evento'}</h3>

        <div className="certificate-details">
          <div className="certificate-detail-item">
            <div className="certificate-detail-label">Fecha</div>
            <div className="certificate-detail-value">
              {certificate.event?.startDate ? formatDate(certificate.event.startDate) : 'Por confirmar'}
            </div>
          </div>
          <div className="certificate-detail-item">
            <div className="certificate-detail-label">Duración</div>
            <div className="certificate-detail-value">
              {certificate.event?.startDate && certificate.event?.endDate
                ? calculateDuration(certificate.event.startDate, certificate.event.endDate)
                : 'N/A'}
            </div>
          </div>
          <div className="certificate-detail-item">
            <div className="certificate-detail-label">Modalidad</div>
            <div className="certificate-detail-value">
              {certificate.event?.isVirtual ? 'Virtual' : 'Presencial'}
            </div>
          </div>
        </div>

        <div className="certificate-verification">
          <div className="verification-title">🔐 Verificación Blockchain</div>
          <div className="blockchain-hash">
            Hash: {certificate.blockchainHash || certificate.certificateHash}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center' }}>
            Este certificado está verificado en Ethereum Blockchain
          </p>
        </div>

        <div className="certificate-actions">
          <button className="btn-primary" onClick={onDownload}>
            📥 Descargar PDF
          </button>
          <button className="btn-secondary" onClick={onShare}>
            🔗 Compartir
          </button>
          <button className="btn-secondary" onClick={onVerify}>
            ✓ Verificar Autenticidad
          </button>
        </div>
      </div>
    </div>
  )
}

export default CertificateCard