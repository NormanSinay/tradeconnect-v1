import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaChevronRight, FaEnvelope, FaPhone, FaComments, FaQuestionCircle } from 'react-icons/fa'
import FAQAccordion from '@/components/ui/faq-accordion'
import SupportCards from '@/components/ui/support-cards'

const TermsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('terminos')

  const sections = [
    { id: 'terminos', title: 'Términos y Condiciones', icon: '📋' },
    { id: 'privacidad', title: 'Política de Privacidad', icon: '🔒' },
    { id: 'cookies', title: 'Política de Cookies', icon: '🍪' },
    { id: 'aviso', title: 'Aviso Legal', icon: '⚖️' },
    { id: 'camara', title: 'Cámara de Comercio', icon: '🏛️' },
    { id: 'afiliacion', title: 'Afiliación', icon: '🤝' },
    { id: 'faq', title: 'Preguntas Frecuentes', icon: '❓' },
    { id: 'soporte', title: 'Soporte Técnico', icon: '🛠️' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'terminos':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Términos y Condiciones
              </h1>
              <p className="text-gray-600">Última actualización: 15 de Octubre, 2023</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Bienvenido a TradeConnect, la plataforma e-commerce para la gestión y comercialización de eventos y cursos de la Cámara de Comercio de Guatemala. Al acceder y utilizar nuestros servicios, usted acepta cumplir con los siguientes términos y condiciones.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Al registrarse en TradeConnect, usted acepta estar sujeto a estos Términos y Condiciones, nuestra Política de Privacidad y todas las leyes y regulaciones aplicables.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-700 leading-relaxed mb-4">TradeConnect proporciona una plataforma para:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Registro y gestión de eventos y cursos</li>
                <li>Procesamiento de pagos en línea</li>
                <li>Gestión de participantes y asistentes</li>
                <li>Comunicación entre organizadores y participantes</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">3. Registro de Cuenta</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para utilizar nuestros servicios, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">4. Pagos y Reembolsos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todos los pagos se procesan a través de nuestra plataforma segura. Las políticas de reembolso varían según el organizador del evento o curso.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">5. Propiedad Intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todo el contenido de TradeConnect, incluyendo logotipos, textos, gráficos y software, es propiedad de la Cámara de Comercio de Guatemala o de sus licenciantes.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">6. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TradeConnect no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de uso de nuestros servicios.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">7. Modificaciones</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#6B1E22]">
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> Estos términos pueden actualizarse periódicamente. Le recomendamos revisarlos regularmente.
                </p>
              </div>
            </div>
          </motion.div>
        )

      case 'privacidad':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Política de Privacidad
              </h1>
              <p className="text-gray-600">Cómo protegemos y utilizamos su información personal</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                En TradeConnect, valoramos y respetamos su privacidad. Esta política explica cómo recopilamos, utilizamos y protegemos su información personal.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">1. Información que Recopilamos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Recopilamos información que usted nos proporciona directamente, incluyendo:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Información de contacto (nombre, email, teléfono)</li>
                <li>Información de perfil profesional</li>
                <li>Datos de pago (procesados de forma segura)</li>
                <li>Preferencias de comunicación</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">2. Uso de la Información</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Utilizamos su información para:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Procesar sus transacciones</li>
                <li>Comunicarnos con usted sobre eventos y cursos</li>
                <li>Personalizar su experiencia en la plataforma</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">3. Compartición de Información</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                No vendemos ni alquilamos su información personal a terceros. Podemos compartir información con:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Organizadores de eventos para los que se registra</li>
                <li>Proveedores de servicios que nos ayudan a operar la plataforma</li>
                <li>Autoridades cuando sea requerido por ley</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">4. Seguridad de Datos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra acceso no autorizado, alteración o destrucción.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">5. Sus Derechos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Acceder a su información personal</li>
                <li>Rectificar información inexacta</li>
                <li>Eliminar su información personal</li>
                <li>Oponerse al procesamiento de sus datos</li>
                <li>Portabilidad de datos</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">6. Cookies y Tecnologías Similares</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos cookies para mejorar su experiencia. Consulte nuestra Política de Cookies para más detalles.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">7. Contacto</h2>
              <p className="text-gray-700 leading-relaxed">
                Para ejercer sus derechos o hacer preguntas sobre esta política, contacte a nuestro Oficial de Privacidad en{' '}
                <a href="mailto:privacidad@tradeconnect.com" className="text-[#6B1E22] hover:underline">
                  privacidad@tradeconnect.com
                </a>
              </p>
            </div>
          </motion.div>
        )

      case 'cookies':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Política de Cookies
              </h1>
              <p className="text-gray-600">Uso de cookies y tecnologías de tracking</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Esta política explica cómo TradeConnect utiliza cookies y tecnologías similares para reconocerlo cuando visita nuestra plataforma.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">1. ¿Qué son las Cookies?</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita sitios web. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">2. Tipos de Cookies que Utilizamos</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-[#6B1E22] font-semibold">Tipo de Cookie</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-[#6B1E22] font-semibold">Propósito</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-[#6B1E22] font-semibold">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Esenciales</td>
                      <td className="border border-gray-300 px-4 py-2">Necesarias para el funcionamiento básico del sitio</td>
                      <td className="border border-gray-300 px-4 py-2">Sesión/Persistentes</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Funcionalidad</td>
                      <td className="border border-gray-300 px-4 py-2">Recordar sus preferencias y configuraciones</td>
                      <td className="border border-gray-300 px-4 py-2">Persistentes</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Analíticas</td>
                      <td className="border border-gray-300 px-4 py-2">Comprender cómo los usuarios interactúan con nuestro sitio</td>
                      <td className="border border-gray-300 px-4 py-2">Persistentes</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Publicidad</td>
                      <td className="border border-gray-300 px-4 py-2">Mostrar anuncios relevantes para sus intereses</td>
                      <td className="border border-gray-300 px-4 py-2">Persistentes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">3. Cookies de Terceros</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Utilizamos servicios de terceros que pueden colocar cookies en su dispositivo, incluyendo:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Google Analytics para análisis web</li>
                <li>Servicios de pago para procesar transacciones</li>
                <li>Redes sociales para funciones de integración</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">4. Control de Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Puede controlar y/o eliminar cookies según desee. Puede eliminar todas las cookies que ya están en su dispositivo y configurar la mayoría de los navegadores para evitar que se coloquen.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">5. Cambios en esta Política</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Podemos actualizar esta política periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#6B1E22]">
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> Al continuar utilizando TradeConnect, usted acepta nuestro uso de cookies de acuerdo con esta política.
                </p>
              </div>
            </div>
          </motion.div>
        )

      case 'aviso':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Aviso Legal
              </h1>
              <p className="text-gray-600">Información legal corporativa de TradeConnect</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">1. Información Corporativa</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <p className="text-gray-700 leading-relaxed mb-2"><strong>Nombre Comercial:</strong> TradeConnect</p>
                <p className="text-gray-700 leading-relaxed mb-2"><strong>Entidad:</strong> Cámara de Comercio de Guatemala</p>
                <p className="text-gray-700 leading-relaxed mb-2"><strong>Dirección Legal:</strong> 5ta. Avenida 5-55, Zona 14, Edificio Cámara de Comercio, Ciudad de Guatemala, Guatemala</p>
                <p className="text-gray-700 leading-relaxed mb-2"><strong>NIT:</strong> 1234567-8</p>
                <p className="text-gray-700 leading-relaxed mb-2"><strong>Email Legal:</strong> legal@tradeconnect.com</p>
                <p className="text-gray-700 leading-relaxed mb-2"><strong>Teléfono:</strong> +502 2385 5000</p>
                <p className="text-gray-700 leading-relaxed"><strong>Registro Mercantil:</strong> Folio 123456, Libro 789 del Registro Mercantil</p>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">2. Propiedad Intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todos los derechos de propiedad intelectual del contenido de TradeConnect, incluyendo pero no limitándose a: logotipos, textos, gráficos, imágenes, software, bases de datos, diseños, signos distintivos, nombres comerciales, dominios y cualquier otro elemento incorporado en el sitio web, son propiedad exclusiva de la Cámara de Comercio de Guatemala o de sus licenciantes respectivos.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra forma de explotación de los contenidos de TradeConnect sin la autorización previa y por escrito de la Cámara de Comercio de Guatemala.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">3. Condiciones de Uso</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                El acceso y uso de TradeConnect implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal, en los Términos y Condiciones, en la Política de Privacidad y en cualquier otra norma o política aplicable.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Los usuarios se comprometen a utilizar la plataforma de manera responsable, respetando la legislación vigente y no realizando actividades que puedan perjudicar el funcionamiento de la plataforma o los derechos de otros usuarios.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">4. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TradeConnect no se hace responsable de los daños y perjuicios de cualquier naturaleza que puedan derivarse de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>La falta de disponibilidad, continuidad o funcionamiento correcto del sitio web</li>
                <li>La falta de utilidad del sitio para actividades específicas de los usuarios</li>
                <li>La existencia de virus, programas maliciosos, caballos de Troya o contenido lesivo</li>
                <li>El uso ilícito, negligente, fraudulento o contrario a este Aviso Legal</li>
                <li>La violación de derechos de propiedad intelectual o industrial</li>
                <li>La realización de actos de competencia desleal o publicidad ilícita</li>
                <li>La inexactitud, falta de actualización o errores en los contenidos</li>
                <li>Los daños causados por terceros a través de accesos no autorizados</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">5. Legislación Aplicable y Jurisdicción</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Este Aviso Legal se rige en todos y cada uno de sus extremos por la legislación guatemalteca. Para cualquier controversia que pudiera derivarse del acceso o uso de TradeConnect, las partes se someten expresamente a la jurisdicción de los Tribunales de Justicia de la República de Guatemala, renunciando a cualquier otro fuero que pudiera corresponderles.
              </p>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">6. Modificaciones</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                La Cámara de Comercio de Guatemala se reserva el derecho de modificar unilateralmente, en cualquier momento y sin previo aviso, la presentación, configuración y contenidos del sitio web, así como las condiciones de uso y acceso al mismo.
              </p>

              <div className="bg-blue-50 border-l-4 border-[#2c5aa0] p-4">
                <p className="text-sm text-gray-700">
                  <strong>Última actualización:</strong> 15 de Octubre, 2023
                </p>
              </div>
            </div>
          </motion.div>
        )

      case 'camara':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Cámara de Comercio de Guatemala
              </h1>
              <p className="text-gray-600">Institución líder en el desarrollo empresarial guatemalteco</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-[#6B1E22] to-[#8a2b30] text-white p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
                <p className="text-lg leading-relaxed">
                  Promover el desarrollo sostenible del sector empresarial guatemalteco, fomentando el comercio, la innovación y el crecimiento económico a través de servicios de calidad y representación efectiva.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">Historia y Trayectoria</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Fundada en 1973, la Cámara de Comercio de Guatemala es la institución empresarial más antigua y representativa del país. Desde sus inicios, ha sido el puente entre el sector privado y las autoridades gubernamentales, contribuyendo decisivamente al desarrollo económico nacional.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                A lo largo de cinco décadas, hemos acompañado el crecimiento de miles de empresas guatemaltecas, promoviendo el comercio internacional, la innovación tecnológica y las mejores prácticas empresariales.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-[#6B1E22] mb-3">Nuestros Valores</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center"><span className="w-2 h-2 bg-[#6B1E22] rounded-full mr-3"></span>Integridad y transparencia</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-[#6B1E22] rounded-full mr-3"></span>Compromiso con el desarrollo</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-[#6B1E22] rounded-full mr-3"></span>Innovación constante</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-[#6B1E22] rounded-full mr-3"></span>Responsabilidad social</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-[#6B1E22] mb-3">Nuestra Visión</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Ser la institución líder en la promoción del desarrollo empresarial sostenible, reconocida por su capacidad de innovación, su compromiso con la excelencia y su contribución al progreso económico y social de Guatemala.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">Servicios Empresariales</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-[#6B1E22] mb-2">Asesoría Legal</h4>
                  <p className="text-sm text-gray-700">Apoyo jurídico especializado para empresas de todos los tamaños.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-[#6B1E22] mb-2">Capacitación</h4>
                  <p className="text-sm text-gray-700">Programas de formación continua para el desarrollo profesional.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-[#6B1E22] mb-2">Networking</h4>
                  <p className="text-sm text-gray-700">Espacios para el establecimiento de contactos comerciales.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-[#6B1E22] mb-2">Certificaciones</h4>
                  <p className="text-sm text-gray-700">Validación de competencias y procesos empresariales.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-[#6B1E22] mb-2">Consultoría</h4>
                  <p className="text-sm text-gray-700">Asesoramiento estratégico para el crecimiento empresarial.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-[#6B1E22] mb-2">Promoción Comercial</h4>
                  <p className="text-sm text-gray-700">Apoyo en la internacionalización y expansión de mercados.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">Comités y Grupos Empresariales</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Contamos con diversos comités sectoriales que agrupan a empresas por rama de actividad, facilitando el diálogo con las autoridades y el desarrollo de iniciativas conjuntas. Entre ellos destacan:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Comité de Comercio Internacional</li>
                <li>Comité de Tecnología e Innovación</li>
                <li>Comité de Pequeñas y Medianas Empresas</li>
                <li>Comité de Mujeres Empresarias</li>
                <li>Comité de Jóvenes Empresarios</li>
                <li>Comité de Sostenibilidad y Responsabilidad Social</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">TradeConnect: Nuestra Plataforma Digital</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TradeConnect representa la evolución digital de nuestros servicios tradicionales. Esta plataforma innovadora permite a nuestros afiliados acceder a eventos, cursos y oportunidades de networking de manera eficiente y segura, consolidando nuestro compromiso con la modernización del sector empresarial guatemalteco.
              </p>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h3 className="font-bold text-green-800 mb-2">Únete a Nuestra Comunidad</h3>
                <p className="text-green-700 mb-3">
                  Más de 15,000 empresas confían en la Cámara de Comercio de Guatemala para su desarrollo y crecimiento.
                </p>
                <Link to="/afiliacion" className="inline-block bg-[#6B1E22] text-white px-6 py-2 rounded-lg hover:bg-[#8a2b30] transition-colors">
                  Conoce los beneficios de afiliarte
                </Link>
              </div>
            </div>
          </motion.div>
        )

      case 'afiliacion':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Afiliación a la Cámara de Comercio
              </h1>
              <p className="text-gray-600">Únete a la red empresarial más importante de Guatemala</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-[#6B1E22] to-[#8a2b30] text-white p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">¿Por qué afiliarse?</h2>
                <p className="text-lg leading-relaxed">
                  La afiliación a la Cámara de Comercio de Guatemala te conecta con una red de más de 15,000 empresas, brindándote acceso exclusivo a oportunidades de negocio, capacitación y representación institucional.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">Categorías de Afiliación</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-sm hover:border-[#6B1E22] transition-colors">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-[#6B1E22]">Empresas</h3>
                    <p className="text-3xl font-bold text-[#6B1E22] mt-2">Q2,500</p>
                    <p className="text-sm text-gray-600">anuales</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Acceso completo a TradeConnect</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Participación en eventos</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Asesoría legal básica</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Certificaciones empresariales</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Networking empresarial</li>
                  </ul>
                  <button className="w-full bg-[#6B1E22] text-white py-2 rounded-lg hover:bg-[#8a2b30] transition-colors">
                    Solicitar Afiliación
                  </button>
                </div>

                <div className="bg-white border-2 border-[#6B1E22] p-6 rounded-lg shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#6B1E22] text-white px-3 py-1 rounded-full text-sm font-semibold">Más Popular</span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-[#6B1E22]">Empresas Premium</h3>
                    <p className="text-3xl font-bold text-[#6B1E22] mt-2">Q5,000</p>
                    <p className="text-sm text-gray-600">anuales</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Todo lo incluido en Empresas</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Asesoría legal especializada</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Consultoría estratégica</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Promoción internacional</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Acceso prioritario a eventos</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Espacio publicitario en directorio</li>
                  </ul>
                  <button className="w-full bg-[#6B1E22] text-white py-2 rounded-lg hover:bg-[#8a2b30] transition-colors">
                    Solicitar Afiliación Premium
                  </button>
                </div>

                <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-sm hover:border-[#6B1E22] transition-colors">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-[#6B1E22]">Profesionales</h3>
                    <p className="text-3xl font-bold text-[#6B1E22] mt-2">Q500</p>
                    <p className="text-sm text-gray-600">anuales</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Acceso a TradeConnect</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Participación en cursos</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Networking profesional</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Certificaciones individuales</li>
                    <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Acceso a biblioteca digital</li>
                  </ul>
                  <button className="w-full bg-[#6B1E22] text-white py-2 rounded-lg hover:bg-[#8a2b30] transition-colors">
                    Solicitar Afiliación
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">Proceso de Afiliación</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#6B1E22] text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                    <h4 className="font-semibold text-[#6B1E22]">Solicitud</h4>
                    <p className="text-sm text-gray-600">Completa el formulario en línea</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#6B1E22] text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                    <h4 className="font-semibold text-[#6B1E22]">Revisión</h4>
                    <p className="text-sm text-gray-600">Evaluación de documentación</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#6B1E22] text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                    <h4 className="font-semibold text-[#6B1E22]">Aprobación</h4>
                    <p className="text-sm text-gray-600">Confirmación de membresía</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#6B1E22] text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                    <h4 className="font-semibold text-[#6B1E22]">Activación</h4>
                    <p className="text-sm text-gray-600">Acceso completo a beneficios</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">Beneficios Exclusivos</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#6B1E22] mb-3">Desarrollo Empresarial</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Capacitación especializada en gestión empresarial</li>
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Asesoría en procesos de internacionalización</li>
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Acceso a fondos y programas de financiamiento</li>
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Participación en misiones comerciales</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#6B1E22] mb-3">Networking y Visibilidad</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Inclusión en directorio empresarial digital</li>
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Participación en eventos exclusivos</li>
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Acceso a base de datos de proveedores</li>
                    <li className="flex items-start"><span className="text-[#6B1E22] mr-2 mt-1">•</span>Oportunidades de alianzas estratégicas</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#6B1E22] mt-8 mb-4">Testimonios de Afiliados</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-[#6B1E22] text-white rounded-full flex items-center justify-center font-bold mr-3">M</div>
                    <div>
                      <h4 className="font-semibold text-[#6B1E22]">María González</h4>
                      <p className="text-sm text-gray-600">Directora Ejecutiva, TechSolutions</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm italic">
                    "La afiliación a la Cámara nos ha abierto puertas increíbles. Los contactos y oportunidades de negocio que hemos generado superan con creces la inversión."
                  </p>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-[#6B1E22] text-white rounded-full flex items-center justify-center font-bold mr-3">C</div>
                    <div>
                      <h4 className="font-semibold text-[#6B1E22]">Carlos Rodríguez</h4>
                      <p className="text-sm text-gray-600">Gerente General, Industrias Maya</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm italic">
                    "Los servicios de consultoría y la red de contactos nos han ayudado a expandirnos internacionalmente. Altamente recomendado."
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-bold text-blue-800 mb-2">¿Listo para afiliarte?</h3>
                <p className="text-blue-700 mb-3">
                  Únete hoy mismo a la comunidad empresarial más influyente de Guatemala y accede a beneficios exclusivos que impulsarán el crecimiento de tu negocio.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="bg-[#6B1E22] text-white px-6 py-2 rounded-lg hover:bg-[#8a2b30] transition-colors">
                    Iniciar Proceso de Afiliación
                  </button>
                  <button className="border border-[#6B1E22] text-[#6B1E22] px-6 py-2 rounded-lg hover:bg-[#6B1E22] hover:text-white transition-colors">
                    Solicitar Información
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'faq':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Preguntas Frecuentes
              </h1>
              <p className="text-gray-600">Respuestas a las consultas más comunes</p>
            </div>

            <FAQAccordion
              items={[
                {
                  id: 'register',
                  question: '¿Cómo me registro en TradeConnect?',
                  answer: 'Para registrarse en TradeConnect, haga clic en el botón "Registrarse" en la esquina superior derecha de cualquier página. Complete el formulario con su información personal y profesional, cree una contraseña segura y acepte los términos y condiciones. Recibirá un email de confirmación para activar su cuenta.'
                },
                {
                  id: 'payment',
                  question: '¿Qué métodos de pago aceptan?',
                  answer: 'Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), transferencias bancarias y PayPal. Todos los pagos se procesan de forma segura a través de nuestro sistema encriptado.'
                },
                {
                  id: 'cancel',
                  question: '¿Puedo cancelar mi inscripción a un evento?',
                  answer: 'Las políticas de cancelación varían según el organizador del evento. Generalmente, puede cancelar su inscripción desde su panel de usuario hasta 48 horas antes del evento. Consulte los términos específicos de cada evento antes de registrarse.'
                },
                {
                  id: 'contact',
                  question: '¿Cómo contacto al organizador de un evento?',
                  answer: 'Puede contactar al organizador a través de la página del evento específico. Allí encontrará información de contacto o un formulario para enviar mensajes directamente. También puede ver los detalles de contacto en el email de confirmación de su inscripción.'
                },
                {
                  id: 'password',
                  question: '¿Qué hago si olvidé mi contraseña?',
                  answer: 'En la página de inicio de sesión, haga clic en "¿Olvidó su contraseña?". Ingrese su dirección de email y le enviaremos un enlace para restablecer su contraseña. Asegúrese de revisar su carpeta de spam si no recibe el email en unos minutos.'
                }
              ]}
            />
          </motion.div>
        )

      case 'soporte':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#6B1E22] mb-2">
                Soporte Técnico
              </h1>
              <p className="text-gray-600">Estamos aquí para ayudarle</p>
            </div>

            <SupportCards
              cards={[
                {
                  id: 'email',
                  icon: <FaEnvelope className="text-3xl" />,
                  title: 'Email',
                  description: 'Envíenos un email y le responderemos en menos de 24 horas',
                  action: {
                    type: 'link',
                    href: 'mailto:soporte@tradeconnect.com',
                    text: 'Enviar Email'
                  }
                },
                {
                  id: 'phone',
                  icon: <FaPhone className="text-3xl" />,
                  title: 'Teléfono',
                  description: 'Llámenos de lunes a viernes de 8:00 a 17:00 horas',
                  action: {
                    type: 'link',
                    href: 'tel:+50212345678',
                    text: '+502 1234 5678'
                  }
                },
                {
                  id: 'chat',
                  icon: <FaComments className="text-3xl" />,
                  title: 'Chat en Vivo',
                  description: 'Chat en tiempo real con nuestro equipo de soporte',
                  action: {
                    type: 'button',
                    onClick: () => alert('El chat en vivo se abrirá en una nueva ventana'),
                    text: 'Iniciar Chat'
                  }
                },
                {
                  id: 'help',
                  icon: <FaQuestionCircle className="text-3xl" />,
                  title: 'Centro de Ayuda',
                  description: 'Encuentre respuestas en nuestra base de conocimiento',
                  action: {
                    type: 'button',
                    onClick: () => setActiveSection('faq'),
                    text: 'Ver FAQ'
                  }
                }
              ]}
            />
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
              <h3 className="text-lg font-semibold text-[#6B1E22] mb-4">Información Legal</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
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

export default TermsPage