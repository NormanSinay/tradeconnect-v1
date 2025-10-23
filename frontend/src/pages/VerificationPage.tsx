import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaChevronRight, FaSearch, FaQrcode, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaPrint, FaShare, FaMobileAlt } from 'react-icons/fa'

interface VerificationResult {
  isValid: boolean
  status: 'valid' | 'invalid' | 'expired' | 'used'
  certificate?: {
    code: string
    name: string
    event: string
    date: string
    duration: string
    organizer: string
  }
  ticket?: {
    code: string
    name: string
    event: string
    date: string
    location: string
    type: string
    state: string
  }
  message?: string
}

const VerificationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('certificates')
  const [certificateCode, setCertificateCode] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [certificateResult, setCertificateResult] = useState<VerificationResult | null>(null)
  const [ticketResult, setTicketResult] = useState<VerificationResult | null>(null)
  const [isVerifyingCertificate, setIsVerifyingCertificate] = useState(false)
  const [isVerifyingTicket, setIsVerifyingTicket] = useState(false)

  const sections = [
    { id: 'certificates', title: 'Verificador de Certificados', icon: '🔍' },
    { id: 'tickets', title: 'Verificador de Tickets', icon: '🔍' },
  ]

  const verifyCertificate = async (code: string) => {
    setIsVerifyingCertificate(true)
    try {
      // Simulación de llamada a API - reemplazar con llamada real
      const response = await fetch(`/api/public/certificates/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateNumber: code,
          method: 'number_lookup'
        })
      })

      const data = await response.json()

      if (data.success && data.data?.isValid) {
        setCertificateResult({
          isValid: true,
          status: 'valid',
          certificate: {
            code: data.data.certificate?.code || code,
            name: data.data.certificate?.participantName || 'Nombre no disponible',
            event: data.data.certificate?.eventName || 'Evento no disponible',
            date: data.data.certificate?.issuedAt || 'Fecha no disponible',
            duration: data.data.certificate?.duration || 'Duración no disponible',
            organizer: data.data.certificate?.organizer || 'Organizador no disponible'
          }
        })
      } else {
        setCertificateResult({
          isValid: false,
          status: 'invalid',
          message: data.message || 'Certificado no válido o no encontrado'
        })
      }
    } catch (error) {
      setCertificateResult({
        isValid: false,
        status: 'invalid',
        message: 'Error al verificar el certificado. Intente nuevamente.'
      })
    } finally {
      setIsVerifyingCertificate(false)
    }
  }

  const verifyTicket = async (code: string) => {
    setIsVerifyingTicket(true)
    try {
      // Simulación de llamada a API - reemplazar con llamada real
      const response = await fetch(`/api/qr/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrHash: code,
          eventId: 1, // Esto debería obtenerse del contexto o formulario
          accessPoint: 'Verificación Pública'
        })
      })

      const data = await response.json()

      if (data.success && data.data?.validation?.isValid) {
        setTicketResult({
          isValid: true,
          status: 'valid',
          ticket: {
            code: data.data.validation?.qrId?.toString() || code,
            name: data.data.validation?.userName || 'Nombre no disponible',
            event: 'Evento no disponible', // Esto debería venir de la API
            date: 'Fecha no disponible', // Esto debería venir de la API
            location: 'Ubicación no disponible', // Esto debería venir de la API
            type: 'Tipo no disponible', // Esto debería venir de la API
            state: 'Estado no disponible' // Esto debería venir de la API
          }
        })
      } else {
        setTicketResult({
          isValid: false,
          status: data.error === 'QR_EXPIRED' ? 'expired' : data.error === 'QR_ALREADY_USED' ? 'used' : 'invalid',
          message: data.message || 'Ticket no válido o no encontrado'
        })
      }
    } catch (error) {
      setTicketResult({
        isValid: false,
        status: 'invalid',
        message: 'Error al verificar el ticket. Intente nuevamente.'
      })
    } finally {
      setIsVerifyingTicket(false)
    }
  }

  const handleCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (certificateCode.trim()) {
      verifyCertificate(certificateCode.trim().toUpperCase())
    }
  }

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticketCode.trim()) {
      verifyTicket(ticketCode.trim().toUpperCase())
    }
  }

  const resetResults = () => {
    setCertificateResult(null)
    setTicketResult(null)
    setCertificateCode('')
    setTicketCode('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <FaCheckCircle className="text-green-500" />
      case 'invalid':
        return <FaTimesCircle className="text-red-500" />
      case 'expired':
        return <FaExclamationTriangle className="text-yellow-500" />
      case 'used':
        return <FaExclamationTriangle className="text-yellow-500" />
      default:
        return <FaTimesCircle className="text-red-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return 'VÁLIDO'
      case 'invalid':
        return 'NO VÁLIDO'
      case 'expired':
        return 'EXPIRADO'
      case 'used':
        return 'UTILIZADO'
      default:
        return 'NO VÁLIDO'
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'valid':
        return 'status-valid'
      case 'invalid':
        return 'status-invalid'
      case 'expired':
        return 'status-warning'
      case 'used':
        return 'status-warning'
      default:
        return 'status-invalid'
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'certificates':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Verificador de Certificados
              </h1>
              <p className="text-gray-600">Valide la autenticidad de certificados emitidos por TradeConnect</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                Ingrese el código de verificación del certificado para validar su autenticidad. El código se encuentra en la parte inferior del certificado emitido.
              </p>

              <form onSubmit={handleCertificateSubmit} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="certificate-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Verificación
                  </label>
                  <input
                    type="text"
                    id="certificate-code"
                    value={certificateCode}
                    onChange={(e) => setCertificateCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E22] focus:border-transparent transition-colors"
                    placeholder="Ej: CERT-2025-001234-ABC123"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Ingrese el código de 20 caracteres que aparece en el certificado</p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCertificate}
                  className="w-full bg-[#6B1E22] text-white py-3 px-6 rounded-lg hover:bg-[#8a2b30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifyingCertificate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Verificar Certificado
                    </>
                  )}
                </button>
              </form>

              {certificateResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="result-card"
                >
                  <div className="result-header">
                    <h2 className="result-title">
                      <FaSearch />
                      Resultado de Verificación
                    </h2>
                    <span className={`result-status ${getStatusClass(certificateResult.status)}`}>
                      {getStatusIcon(certificateResult.status)}
                      {getStatusText(certificateResult.status)}
                    </span>
                  </div>

                  {certificateResult.isValid && certificateResult.certificate ? (
                    <div className="result-details">
                      <div className="detail-item">
                        <div className="detail-label">Código de Certificado</div>
                        <div className="detail-value">{certificateResult.certificate.code}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Nombre del Participante</div>
                        <div className="detail-value">{certificateResult.certificate.name}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Evento o Curso</div>
                        <div className="detail-value">{certificateResult.certificate.event}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Fecha de Emisión</div>
                        <div className="detail-value">{certificateResult.certificate.date}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Duración</div>
                        <div className="detail-value">{certificateResult.certificate.duration}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Organizador</div>
                        <div className="detail-value">{certificateResult.certificate.organizer}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">{certificateResult.message}</p>
                    </div>
                  )}

                  {certificateResult.isValid && (
                    <div className="action-buttons">
                      <button className="btn btn-outline" onClick={() => window.print()}>
                        <FaPrint />
                        Imprimir Resultado
                      </button>
                      <button className="btn btn-primary" onClick={() => {
                        const text = `Certificado verificado: ${certificateResult.certificate?.code} - ${certificateResult.certificate?.name}`
                        navigator.share?.({ text }) || navigator.clipboard?.writeText(text)
                      }}>
                        <FaShare />
                        Compartir Verificación
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold text-[#6B1E22] mb-4">Verificación por Código QR</h3>
              <div className="qr-section">
                <div className="qr-code">
                  <FaMobileAlt className="text-5xl" />
                </div>
                <p className="qr-info">Escanea el código QR en tu certificado con la cámara de tu dispositivo para verificar automáticamente.</p>
                <button className="btn btn-outline">
                  <FaQrcode />
                  Escanear Código QR
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold text-[#6B1E22] mb-4">Información Importante</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Los certificados verificados a través de este sistema son emitidos oficialmente por TradeConnect.
                </li>
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Si el certificado no aparece como válido, contacte al organizador del evento o curso.
                </li>
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Los códigos de verificación son únicos para cada certificado y no pueden ser duplicados.
                </li>
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Para reportar un certificado fraudulento, contacte a{' '}
                  <a href="mailto:certificados@tradeconnect.com" className="text-[#6B1E22] hover:underline">
                    certificados@tradeconnect.com
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
        )

      case 'tickets':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Verificador de Tickets
              </h1>
              <p className="text-gray-600">Valide la autenticidad de tickets para eventos de TradeConnect</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                Ingrese el código del ticket o escanee el código QR para validar su autenticidad y estado.
              </p>

              <form onSubmit={handleTicketSubmit} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="ticket-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Ticket
                  </label>
                  <input
                    type="text"
                    id="ticket-code"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E22] focus:border-transparent transition-colors"
                    placeholder="Ej: TC-TKT-2025-XYZ789"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Ingrese el código de 15 caracteres que aparece en el ticket</p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingTicket}
                  className="w-full bg-[#6B1E22] text-white py-3 px-6 rounded-lg hover:bg-[#8a2b30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifyingTicket ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Verificar Ticket
                    </>
                  )}
                </button>
              </form>

              {ticketResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="result-card"
                >
                  <div className="result-header">
                    <h2 className="result-title">
                      <FaSearch />
                      Resultado de Verificación
                    </h2>
                    <span className={`result-status ${getStatusClass(ticketResult.status)}`}>
                      {getStatusIcon(ticketResult.status)}
                      {getStatusText(ticketResult.status)}
                    </span>
                  </div>

                  {ticketResult.isValid && ticketResult.ticket ? (
                    <div className="result-details">
                      <div className="detail-item">
                        <div className="detail-label">Código del Ticket</div>
                        <div className="detail-value">{ticketResult.ticket.code}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Nombre del Asistente</div>
                        <div className="detail-value">{ticketResult.ticket.name}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Evento</div>
                        <div className="detail-value">{ticketResult.ticket.event}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Fecha y Hora</div>
                        <div className="detail-value">{ticketResult.ticket.date}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Ubicación</div>
                        <div className="detail-value">{ticketResult.ticket.location}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Tipo de Ticket</div>
                        <div className="detail-value">{ticketResult.ticket.type}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Estado</div>
                        <div className="detail-value">{ticketResult.ticket.state}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">{ticketResult.message}</p>
                    </div>
                  )}

                  {ticketResult.isValid && (
                    <div className="action-buttons">
                      <button className="btn btn-outline" onClick={() => window.print()}>
                        <FaPrint />
                        Imprimir Resultado
                      </button>
                      <button className="btn btn-primary" onClick={() => {
                        const text = `Ticket verificado: ${ticketResult.ticket?.code} - ${ticketResult.ticket?.name}`
                        navigator.share?.({ text }) || navigator.clipboard?.writeText(text)
                      }}>
                        <FaShare />
                        Compartir Verificación
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold text-[#6B1E22] mb-4">Verificación por Código QR</h3>
              <div className="qr-section">
                <div className="qr-code">
                  <FaMobileAlt className="text-5xl" />
                </div>
                <p className="qr-info">Escanea el código QR en el ticket con la cámara de tu dispositivo para verificar automáticamente.</p>
                <button className="btn btn-outline">
                  <FaQrcode />
                  Escanear Código QR
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-bold text-[#6B1E22] mb-4">Información para Organizadores</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Utilice esta herramienta para verificar la autenticidad de los tickets en la entrada de su evento.
                </li>
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Los tickets marcados como "utilizados" no pueden ser verificados nuevamente.
                </li>
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Para eventos con control de acceso, se recomienda utilizar la aplicación móvil de TradeConnect.
                </li>
                <li className="flex items-start">
                  <span className="text-[#6B1E22] mr-2">•</span>
                  Si detecta un ticket fraudulento, contacte a{' '}
                  <a href="mailto:tickets@tradeconnect.com" className="text-[#6B1E22] hover:underline">
                    tickets@tradeconnect.com
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
        )

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Contenido no disponible</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-[#6B1E22]">
              TradeConnect
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-[#6B1E22] transition-colors">
                Inicio
              </Link>
              <Link to="/events" className="text-gray-600 hover:text-[#6B1E22] transition-colors">
                Eventos
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-[#6B1E22] transition-colors">
                Acerca de
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-[#6B1E22] transition-colors">
                Contacto
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-[#6B1E22] transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="bg-[#6B1E22] text-white px-4 py-2 rounded-lg hover:bg-[#8a2b30] transition-colors">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-[#6B1E22] mb-4">Verificación Pública</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      resetResults()
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-[#6B1E22] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#6B1E22]'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                    {activeSection === section.id && <FaChevronRight className="ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

    </div>
  )
}

export default VerificationPage