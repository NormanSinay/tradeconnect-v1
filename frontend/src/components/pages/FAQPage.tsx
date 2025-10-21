import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FaChevronDown, FaChevronUp, FaSearch, FaQuestionCircle, FaCreditCard, FaCertificate, FaUser, FaCalendar } from 'react-icons/fa'

export const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const faqCategories = [
    {
      icon: <FaUser className="h-5 w-5" />,
      title: 'Cuenta y Registro',
      color: 'bg-blue-500',
      questions: [
        {
          question: '¿Cómo me registro en TradeConnect?',
          answer: 'Para registrarte, haz clic en "Registrarse" en la barra de navegación. Completa el formulario con tu nombre, email y contraseña. Recibirás un email de verificación para activar tu cuenta.'
        },
        {
          question: '¿Es gratuito registrarse?',
          answer: 'Sí, el registro básico es completamente gratuito. Solo pagas por las inscripciones a eventos específicos.'
        },
        {
          question: '¿Cómo recupero mi contraseña?',
          answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de login. Ingresa tu email y recibirás un enlace para restablecer tu contraseña.'
        },
        {
          question: '¿Puedo tener múltiples cuentas?',
          answer: 'No, cada persona puede tener solo una cuenta activa. Si necesitas múltiples registros para una empresa, contacta a soporte.'
        }
      ]
    },
    {
      icon: <FaCalendar className="h-5 w-5" />,
      title: 'Eventos e Inscripciones',
      color: 'bg-green-500',
      questions: [
        {
          question: '¿Cómo me inscribo a un evento?',
          answer: 'Navega al evento que te interesa, selecciona tu tipo de entrada y sigue el proceso de pago. Recibirás una confirmación por email.'
        },
        {
          question: '¿Puedo cancelar mi inscripción?',
          answer: 'Sí, puedes cancelar hasta 24 horas antes del evento. Consulta la política de reembolso específica de cada evento.'
        },
        {
          question: '¿Qué incluye la inscripción?',
          answer: 'La inscripción incluye acceso al evento, materiales digitales, certificado de participación y soporte técnico.'
        },
        {
          question: '¿Los eventos son presenciales o virtuales?',
          answer: 'Ofrecemos eventos híbridos: presenciales en nuestras instalaciones y virtuales a través de plataformas como Zoom.'
        }
      ]
    },
    {
      icon: <FaCreditCard className="h-5 w-5" />,
      title: 'Pagos y Facturación',
      color: 'bg-purple-500',
      questions: [
        {
          question: '¿Qué métodos de pago aceptan?',
          answer: 'Aceptamos tarjetas de crédito/débito, transferencias bancarias, pagos móviles y procesadores locales como BAM y NeoNet.'
        },
        {
          question: '¿Recibo factura por mi pago?',
          answer: 'Sí, todas las transacciones generan una factura electrónica FEL (Factura Electrónica en Línea) conforme a la legislación guatemalteca.'
        },
        {
          question: '¿Cómo descargo mi factura?',
          answer: 'Las facturas están disponibles en tu panel de usuario en la sección "Mis Facturas". Puedes descargarlas en PDF y XML.'
        },
        {
          question: '¿Ofrecen descuentos o promociones?',
          answer: 'Sí, regularmente tenemos códigos de descuento, promociones grupales y descuentos por volumen. Suscríbete a nuestro newsletter.'
        }
      ]
    },
    {
      icon: <FaCertificate className="h-5 w-5" />,
      title: 'Certificados',
      color: 'bg-orange-500',
      questions: [
        {
          question: '¿Cómo obtengo mi certificado?',
          answer: 'Los certificados se generan automáticamente después de completar el evento. Están disponibles en tu panel de usuario.'
        },
        {
          question: '¿Los certificados son válidos?',
          answer: 'Sí, todos los certificados incluyen verificación blockchain para garantizar su autenticidad e inalterabilidad.'
        },
        {
          question: '¿Puedo verificar un certificado?',
          answer: 'Sí, utiliza nuestra herramienta de verificación pública en el sitio web. Solo necesitas el código único del certificado.'
        },
        {
          question: '¿Cuánto tiempo son válidos los certificados?',
          answer: 'Los certificados son válidos por tiempo indefinido y pueden ser verificados en cualquier momento.'
        }
      ]
    },
    {
      icon: <FaQuestionCircle className="h-5 w-5" />,
      title: 'Soporte Técnico',
      color: 'bg-red-500',
      questions: [
        {
          question: '¿Cómo contacto al soporte?',
          answer: 'Puedes contactarnos por email (soporte@camaradecomercio.gt), teléfono (+502 2222-3333) o a través del formulario de contacto.'
        },
        {
          question: '¿Tienen chat en vivo?',
          answer: 'Sí, ofrecemos chat en vivo durante horario de oficina para consultas urgentes.'
        },
        {
          question: '¿Cómo reporto un problema técnico?',
          answer: 'Utiliza el formulario "Reportar Problema" en tu panel de usuario o contacta directamente al soporte técnico.'
        },
        {
          question: '¿Ofrecen capacitación sobre el uso de la plataforma?',
          answer: 'Sí, tenemos tutoriales en video, guías escritas y sesiones de capacitación gratuitas para nuevos usuarios.'
        }
      ]
    }
  ]

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre TradeConnect
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar en preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                    {category.icon}
                  </div>
                  {category.title}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({category.questions.length} preguntas)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex
                  const isExpanded = expandedItems.has(globalIndex)

                  return (
                    <div key={faqIndex} className="border rounded-lg">
                      <button
                        onClick={() => toggleExpanded(globalIndex)}
                        className="w-full text-left p-4 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <FaChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <FaChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="border-t pt-4">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && searchQuery && (
          <Card>
            <CardContent className="pt-6 text-center">
              <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600 mb-4">
                No encontramos preguntas que coincidan con "{searchQuery}"
              </p>
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
              >
                Ver todas las preguntas
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>¿No encontraste lo que buscas?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Si tu pregunta no está en esta lista, nuestro equipo de soporte está listo para ayudarte.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <div>
                  <div className="font-semibold">Formulario de Contacto</div>
                  <div className="text-sm text-gray-600">Envíanos tu consulta</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div>
                  <div className="font-semibold">Chat en Vivo</div>
                  <div className="text-sm text-gray-600">Atención inmediata</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div>
                  <div className="font-semibold">Centro de Ayuda</div>
                  <div className="text-sm text-gray-600">Guías y tutoriales</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">Eventos Realizados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-gray-600">Participantes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-gray-600">Speakers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Soporte</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}