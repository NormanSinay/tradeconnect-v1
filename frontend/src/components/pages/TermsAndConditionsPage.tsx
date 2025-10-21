import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaFileContract, FaUser, FaCreditCard, FaShieldAlt, FaGavel } from 'react-icons/fa'

export const TermsAndConditionsPage: React.FC = () => {
  const sections = [
    {
      icon: <FaFileContract className="h-6 w-6" />,
      title: 'Aceptación de Términos',
      content: 'Al acceder y utilizar TradeConnect, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo, por favor no uses nuestros servicios.'
    },
    {
      icon: <FaUser className="h-6 w-6" />,
      title: 'Uso del Servicio',
      content: 'El servicio está destinado únicamente para uso personal y comercial legítimo. No está permitido el uso fraudulento, ilegal o que viole derechos de terceros.'
    },
    {
      icon: <FaCreditCard className="h-6 w-6" />,
      title: 'Pagos y Reembolsos',
      content: 'Los pagos se procesan de forma segura. Las políticas de reembolso varían según el tipo de evento y se especifican en cada caso particular.'
    },
    {
      icon: <FaShieldAlt className="h-6 w-6" />,
      title: 'Propiedad Intelectual',
      content: 'Todo el contenido, logos, diseños y software son propiedad de la Cámara de Comercio o sus licenciantes y están protegidos por leyes de propiedad intelectual.'
    },
    {
      icon: <FaGavel className="h-6 w-6" />,
      title: 'Limitación de Responsabilidad',
      content: 'No somos responsables por daños indirectos, incidentales o consecuentes. Nuestra responsabilidad máxima se limita al monto pagado por el servicio.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-600">
            Reglas y condiciones que rigen el uso de TradeConnect
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última actualización: {new Date().toLocaleDateString('es-GT')}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sections.map((section, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mr-3">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Terms */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Definiciones</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul>
                <li><strong>"Servicio"</strong> se refiere a la plataforma TradeConnect y todos sus componentes</li>
                <li><strong>"Usuario"</strong> cualquier persona que accede o utiliza el Servicio</li>
                <li><strong>"Contenido"</strong> incluye texto, imágenes, videos, y otros materiales disponibles en el Servicio</li>
                <li><strong>"Evento"</strong> cualquier actividad, curso, conferencia o taller ofrecido a través de la plataforma</li>
                <li><strong>"Inscripción"</strong> el proceso de registro y pago para participar en un Evento</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Elegibilidad para el Servicio</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Para utilizar nuestros servicios, debes:
              </p>
              <ul>
                <li>Tener al menos 18 años de edad o contar con consentimiento parental</li>
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la confidencialidad de tu cuenta y contraseña</li>
                <li>Cumplir con todas las leyes y regulaciones aplicables</li>
                <li>No utilizar el servicio para fines ilegales o no autorizados</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Cuentas de Usuario</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Al crear una cuenta, eres responsable de:
              </p>
              <ul>
                <li>Proporcionar información precisa y completa</li>
                <li>Mantener actualizada tu información de contacto</li>
                <li>Proteger la seguridad de tu contraseña</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Cerrar tu cuenta si ya no deseas utilizar el servicio</li>
              </ul>
              <p>
                Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Inscripción a Eventos</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Al inscribirte a un evento:
              </p>
              <ul>
                <li>Aceptas cumplir con las reglas específicas del evento</li>
                <li>Te comprometes a asistir o cancelar con anticipación</li>
                <li>Entiendes que los certificados se emiten solo con asistencia completa</li>
                <li>Aceptas recibir comunicaciones relacionadas con el evento</li>
                <li>Reconoces que los precios pueden cambiar sin previo aviso</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Política de Pagos</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h4>5.1 Métodos de Pago</h4>
              <p>
                Aceptamos pagos mediante tarjetas de crédito, débito, transferencias bancarias y
                procesadores de pago electrónicos autorizados en Guatemala.
              </p>

              <h4>5.2 Confirmación de Pago</h4>
              <p>
                Los pagos se confirman automáticamente. Recibirás un comprobante por email y podrás
                acceder a él desde tu panel de usuario.
              </p>

              <h4>5.3 Reembolsos</h4>
              <ul>
                <li><strong>Cancelación anticipada:</strong> Reembolso completo hasta 7 días antes del evento</li>
                <li><strong>Cancelación tardía:</strong> 50% de reembolso hasta 24 horas antes</li>
                <li><strong>No show:</strong> No hay reembolso por inasistencia</li>
                <li><strong>Cancelación del evento:</strong> Reembolso completo</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Certificados y Credenciales</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Los certificados de participación:
              </p>
              <ul>
                <li>Se emiten únicamente con asistencia completa al evento</li>
                <li>Incluyen verificación blockchain para autenticidad</li>
                <li>Pueden descargarse en formato PDF</li>
                <li>Son válidos por tiempo indefinido</li>
                <li>Pueden verificarse públicamente a través de nuestro sitio</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Código de Conducta</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Al utilizar nuestros servicios, te comprometes a:
              </p>
              <ul>
                <li>Tratar con respeto a otros participantes y organizadores</li>
                <li>No compartir información falsa o engañosa</li>
                <li>Respetar la propiedad intelectual de terceros</li>
                <li>No utilizar lenguaje ofensivo o discriminatorio</li>
                <li>Cumplir con las normas de cada evento específico</li>
                <li>No interferir con el funcionamiento técnico del servicio</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Todo el contenido disponible en TradeConnect, incluyendo pero no limitado a:
              </p>
              <ul>
                <li>Textos, gráficos, logos, imágenes y videos</li>
                <li>Software, bases de datos y algoritmos</li>
                <li>Diseños, interfaces y funcionalidades</li>
                <li>Marcas comerciales y nombres comerciales</li>
              </ul>
              <p>
                Está protegido por leyes de propiedad intelectual y no puede ser copiado,
                distribuido o utilizado sin autorización expresa.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Privacidad y Protección de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Tu privacidad es importante para nosotros. Nuestra recopilación y uso de información
                personal se rige por nuestra Política de Privacidad, que forma parte integral de
                estos términos.
              </p>
              <p>
                Al utilizar nuestros servicios, consientes el procesamiento de tus datos según
                lo descrito en la Política de Privacidad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Terminación del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Podemos terminar o suspender tu acceso al servicio inmediatamente, sin previo aviso,
                por cualquier motivo, incluyendo pero no limitado a:
              </p>
              <ul>
                <li>Violación de estos términos y condiciones</li>
                <li>Uso fraudulento o ilegal del servicio</li>
                <li>Incumplimiento de pagos</li>
                <li>Comportamiento disruptivo en eventos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                En la medida máxima permitida por la ley, no seremos responsables por:
              </p>
              <ul>
                <li>Daños indirectos, incidentales, especiales o consecuentes</li>
                <li>Pérdida de beneficios, ingresos o datos</li>
                <li>Interrupciones del servicio o errores técnicos</li>
                <li>Contenido generado por usuarios</li>
                <li>Acciones de terceros proveedores</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Indemnización</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Aceptas indemnizar y mantener indemne a la Cámara de Comercio, sus directores,
                empleados y agentes de cualquier reclamo, demanda, pérdida o daño, incluyendo
                honorarios razonables de abogados, que surjan de:
              </p>
              <ul>
                <li>Tu uso del servicio</li>
                <li>Tu violación de estos términos</li>
                <li>Tu violación de derechos de terceros</li>
                <li>Cualquier contenido que publiques</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Ley Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Estos términos se rigen por las leyes de la República de Guatemala.
                Cualquier disputa será resuelta en los tribunales competentes de la Ciudad de Guatemala.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Los cambios entrarán en vigor inmediatamente después de su publicación.
                El uso continuado del servicio constituye aceptación de los términos modificados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>15. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-gray-600">legal@camaradecomercio.gt</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Teléfono</h4>
                  <p className="text-gray-600">+502 2222-3333</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}