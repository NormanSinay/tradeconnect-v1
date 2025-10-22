import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: 'Dirección',
      content: 'Ciudad de Guatemala, Guatemala',
      color: 'text-red-600'
    },
    {
      icon: FaPhone,
      title: 'Teléfono',
      content: '+502 1234 5678',
      color: 'text-blue-600'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      content: 'info@tradeconnect.com',
      color: 'text-green-600'
    },
    {
      icon: FaClock,
      title: 'Horario de Atención',
      content: 'Lunes a Viernes: 8:00 - 17:00',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#6B1E22] to-[#4a1518] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Contáctanos
            </motion.h1>
            <motion.p
              className="text-xl text-gray-200 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo y
              resolveremos todas tus dudas sobre eventos y cursos.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Información de Contacto</h2>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${info.color.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <info.icon className={`text-xl ${info.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-gray-600">{info.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas ayuda inmediata?</h3>
                <p className="text-gray-600 mb-4">
                  Para consultas urgentes sobre eventos en curso o problemas técnicos,
                  puedes contactarnos directamente por teléfono durante nuestro horario de atención.
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FaClock />
                  <span>Respuesta promedio: 2-4 horas hábiles</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Envíanos un Mensaje</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#6B1E22] focus:border-[#6B1E22] resize-vertical"
                    placeholder="Describe tu consulta o solicitud..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#6B1E22] hover:bg-[#5a191e] text-white py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600">
              Resolvemos las dudas más comunes sobre nuestros servicios
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {[
              {
                question: '¿Cómo puedo registrarme en un evento?',
                answer: 'Puedes registrarte directamente desde la página del evento haciendo clic en "Inscribirse". Necesitarás crear una cuenta o iniciar sesión si ya tienes una.'
              },
              {
                question: '¿Qué métodos de pago aceptan?',
                answer: 'Aceptamos tarjetas de crédito/débito, transferencias bancarias y pagos en efectivo en nuestras oficinas. Próximamente integraremos más métodos de pago.'
              },
              {
                question: '¿Puedo obtener un reembolso si no puedo asistir?',
                answer: 'Las políticas de reembolso varían según el evento. Consulta los términos específicos en la página de cada evento. Generalmente, los reembolsos se procesan hasta 48 horas antes del evento.'
              },
              {
                question: '¿Cómo obtengo mi certificado de participación?',
                answer: 'Los certificados se generan automáticamente al finalizar el evento y quedan disponibles en tu panel de usuario. También puedes descargarlos desde la sección "Mis Certificados".'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ContactPage