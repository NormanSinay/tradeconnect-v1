import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaShieldAlt, FaLock, FaEye, FaUserCheck } from 'react-icons/fa'

export const PrivacyPolicyPage: React.FC = () => {
  const sections = [
    {
      icon: <FaShieldAlt className="h-6 w-6" />,
      title: 'Información que Recopilamos',
      content: [
        'Información personal: nombre, email, teléfono, dirección',
        'Información de pago: procesada de forma segura por pasarelas certificadas',
        'Datos de navegación: cookies, IP, preferencias del sitio',
        'Información de eventos: inscripciones, certificados, asistencia'
      ]
    },
    {
      icon: <FaLock className="h-6 w-6" />,
      title: 'Cómo Protegemos tu Información',
      content: [
        'Encriptación SSL/TLS en todas las transmisiones',
        'Almacenamiento seguro con estándares bancarios',
        'Acceso restringido solo al personal autorizado',
        'Auditorías de seguridad regulares'
      ]
    },
    {
      icon: <FaEye className="h-6 w-6" />,
      title: 'Uso de tu Información',
      content: [
        'Procesar inscripciones y pagos de eventos',
        'Enviar confirmaciones y recordatorios',
        'Generar certificados y comprobantes',
        'Mejorar nuestros servicios y soporte'
      ]
    },
    {
      icon: <FaUserCheck className="h-6 w-6" />,
      title: 'Tus Derechos',
      content: [
        'Acceder a tu información personal',
        'Corregir datos inexactos',
        'Solicitar eliminación de datos',
        'Oponerte al procesamiento de datos'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-gray-600">
            Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos,
            usamos y protegemos tu información personal.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última actualización: {new Date().toLocaleDateString('es-GT')}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                La Cámara de Comercio de Guatemala ("nosotros", "nuestro" o "TradeConnect") se compromete
                a proteger tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos,
                divulgamos y protegemos tu información cuando utilizas nuestros servicios en línea,
                incluyendo nuestro sitio web y aplicaciones móviles.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Al utilizar nuestros servicios, aceptas la recopilación y uso de información de acuerdo
                con esta política. Si no estás de acuerdo con nuestros términos, por favor no uses
                nuestros servicios.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mr-3">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cookies y Tecnologías Similares</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web.
                Las cookies nos ayudan a recordar tus preferencias, analizar el uso del sitio y personalizar
                el contenido.
              </p>
              <h4>Tipos de Cookies:</h4>
              <ul>
                <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                <li><strong>Cookies de rendimiento:</strong> Nos ayudan a mejorar el rendimiento del sitio</li>
                <li><strong>Cookies funcionales:</strong> Recuerdan tus preferencias y configuraciones</li>
                <li><strong>Cookies de marketing:</strong> Usadas para mostrar anuncios relevantes</li>
              </ul>
              <p>
                Puedes controlar las cookies a través de la configuración de tu navegador. Sin embargo,
                desactivar ciertas cookies puede afectar la funcionalidad del sitio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compartir Información</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en
                las siguientes circunstancias:
              </p>
              <ul>
                <li>Con tu consentimiento explícito</li>
                <li>Para cumplir con obligaciones legales</li>
                <li>Para proteger nuestros derechos y propiedad</li>
                <li>Con proveedores de servicios de confianza (procesadores de pago, hosting, etc.)</li>
                <li>En caso de fusión, adquisición o venta de activos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas para
                proteger tu información personal contra acceso no autorizado, alteración, divulgación o
                destrucción.
              </p>
              <p>
                Todas las transmisiones de datos se realizan mediante encriptación SSL/TLS. Los datos
                sensibles se almacenan en servidores seguros con acceso restringido.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Conservamos tu información personal solo durante el tiempo necesario para cumplir con
                los propósitos descritos en esta política, a menos que un período de retención más largo
                sea requerido por ley.
              </p>
              <p>
                Los datos de eventos y certificados se conservan indefinidamente para fines de
                verificación y cumplimiento legal, de acuerdo con las regulaciones guatemaltecas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Derechos ARCO</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                De acuerdo con la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados
                de Guatemala, tienes derecho a:
              </p>
              <ul>
                <li><strong>Acceso:</strong> Solicitar información sobre tus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Cancelación:</strong> Solicitar eliminación de tus datos</li>
                <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
              </ul>
              <p>
                Para ejercer estos derechos, contacta a nuestro Oficial de Protección de Datos en{' '}
                <a href="mailto:privacidad@camaradecomercio.gt" className="text-primary hover:underline">
                  privacidad@camaradecomercio.gt
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambios a esta Política</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre
                cambios significativos mediante email o un aviso destacado en nuestro sitio web.
              </p>
              <p>
                El uso continuado de nuestros servicios después de cambios constituyen aceptación
                de la política actualizada.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Oficial de Protección de Datos</h4>
                <p className="text-gray-600">
                  Email: privacidad@camaradecomercio.gt<br />
                  Teléfono: +502 2222-3333
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Dirección</h4>
                <p className="text-gray-600">
                  Calle Principal #123<br />
                  Zona 1, Ciudad de Guatemala
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}