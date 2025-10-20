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
  }
  registration?: {
    id: number
    status: string
  }
}

interface Event {
  id: number
  title: string
  date: string
  status: 'confirmed' | 'upcoming' | 'completed'
  type: 'event' | 'course'
}

interface ProfileContentProps {
  activeSection?: string
  events?: Event[]
  onViewQR?: (eventId: number) => void
  onViewCertificate?: (eventId: number) => void
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  activeSection = 'events',
  events = [],
  onViewQR = () => {},
  onViewCertificate = () => {}
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (activeSection === 'certificates') {
      fetchCertificates()
    }
  }, [activeSection])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      // TODO: Get user ID from auth context
      const userId = 1 // Placeholder - should come from auth
      const response = await api.get(`/certificates/users/${userId}`)

      if (response.data.success) {
        setCertificates((response.data.data as any).certificates || [])
      } else {
        setError('Error al cargar certificados')
      }
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setError('Error al cargar certificados')
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
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado'
      case 'upcoming': return 'Próximo'
      case 'completed': return 'Completado'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed'
      case 'upcoming': return 'status-upcoming'
      case 'completed': return 'status-completed'
      default: return ''
    }
  }

  return (
    <div className="profile-content">
      <h2 className="profile-section-title">
        {activeSection === 'events' && 'Mis Eventos 🎯'}
        {activeSection === 'courses' && 'Mis Cursos 📚'}
        {activeSection === 'certificates' && 'Mis Certificados 🎓'}
        {activeSection === 'invoices' && 'Facturas FEL 📄'}
        {activeSection === 'settings' && 'Configuración ⚙️'}
      </h2>

      {activeSection === 'events' && (
        <div className="my-events-grid">
          {events.map(event => (
            <div key={event.id} className="my-event-card">
              <div className="my-event-header">
                <div>
                  <div className="my-event-title">{event.title}</div>
                  <div className="my-event-date">📅 {event.date}</div>
                </div>
                <span className={`my-event-status ${getStatusClass(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
              </div>
              <div className="my-event-actions">
                <button className="btn-small btn-qr" onClick={() => onViewQR(event.id)}>
                  📱 Ver QR
                </button>
                {event.status === 'completed' && (
                  <button className="btn-small btn-certificate" onClick={() => onViewCertificate(event.id)}>
                    🎓 Certificado
                  </button>
                )}
                <button className="btn-small btn-certificate">
                  📄 Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'courses' && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <p>No tienes cursos inscritos aún.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Explora nuestros cursos disponibles en la sección de eventos.
          </p>
        </div>
      )}

      {activeSection === 'certificates' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <p>Cargando certificados...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <p>{error}</p>
              <button
                className="btn-primary"
                onClick={fetchCertificates}
                style={{ marginTop: '1rem' }}
              >
                Reintentar
              </button>
            </div>
          ) : certificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <p>Tus certificados aparecerán aquí una vez completes los eventos.</p>
            </div>
          ) : (
            <div className="my-events-grid">
              {certificates.map(certificate => (
                <div key={certificate.id} className="my-event-card">
                  <div className="my-event-header">
                    <div>
                      <div className="my-event-title">
                        {certificate.event?.title || 'Certificado de Participación'}
                      </div>
                      <div className="my-event-date">
                        📅 Emitido: {formatDate(certificate.issuedAt)}
                      </div>
                    </div>
                    <span className="my-event-status status-completed">
                      Blockchain
                    </span>
                  </div>
                  <div className="my-event-actions">
                    <button
                      className="btn-small btn-certificate"
                      onClick={() => onViewCertificate(certificate.registrationId)}
                    >
                      🎓 Ver Certificado
                    </button>
                    <button className="btn-small btn-qr">
                      🔗 Verificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'invoices' && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <p>Tus facturas FEL aparecerán aquí después de cada compra.</p>
        </div>
      )}

      {activeSection === 'settings' && (
        <div style={{ padding: '2rem 0' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Información Personal</h3>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" defaultValue="Juan Pérez" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue="juan@email.com" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" defaultValue="+502 1234-5678" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Preferencias</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                Recibir notificaciones por email
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                Recibir recordatorios de eventos
              </label>
            </div>
          </div>

          <button className="btn-primary" style={{ width: 'auto' }}>
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileContent