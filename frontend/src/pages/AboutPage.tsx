import React from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaAward, FaHandshake, FaRocket } from 'react-icons/fa'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'

const AboutPage: React.FC = () => {
  const stats = [
    { icon: FaUsers, value: '10,000+', label: 'Participantes' },
    { icon: FaAward, value: '500+', label: 'Eventos Realizados' },
    { icon: FaHandshake, value: '200+', label: 'Empresas Socias' },
    { icon: FaRocket, value: '15 años', label: 'de Experiencia' }
  ]

  const values = [
    {
      title: 'Excelencia',
      description: 'Nos comprometemos con la más alta calidad en todos nuestros servicios y eventos.',
      icon: '🏆'
    },
    {
      title: 'Innovación',
      description: 'Utilizamos las últimas tecnologías para mejorar la experiencia de nuestros usuarios.',
      icon: '💡'
    },
    {
      title: 'Colaboración',
      description: 'Fomentamos el trabajo en equipo y las alianzas estratégicas para el crecimiento empresarial.',
      icon: '🤝'
    },
    {
      title: 'Integridad',
      description: 'Actuamos con honestidad, transparencia y ética en todas nuestras operaciones.',
      icon: '⚖️'
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
              Acerca de TradeConnect
            </motion.h1>
            <motion.p
              className="text-xl text-gray-200 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              La plataforma líder en gestión y comercialización de eventos y cursos empresariales en Guatemala,
              impulsando el crecimiento profesional y el networking empresarial desde hace más de 15 años.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-[#6B1E22] rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-[#6B1E22] mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Misión</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Ser la plataforma digital líder que conecta a profesionales, empresas y organizaciones
                a través de eventos y cursos de alta calidad, facilitando el desarrollo profesional
                y el crecimiento empresarial en Guatemala y la región.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nos comprometemos a proporcionar una experiencia excepcional que combine tecnología
                innovadora con contenido relevante, creando espacios donde el aprendizaje y el
                networking se unen para generar oportunidades de crecimiento.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Visión</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Convertirnos en el ecosistema digital más completo y confiable para el desarrollo
                profesional en Centroamérica, donde empresas y profesionales encuentren las
                herramientas necesarias para su crecimiento continuo.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Aspiramos a ser reconocidos como el referente en innovación educativa y networking
                empresarial, contribuyendo activamente al desarrollo económico y social de nuestra región.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
            <p className="text-xl text-gray-600">
              Los principios que guían nuestras acciones y decisiones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestra Historia</h2>
              <p className="text-xl text-gray-600">
                Un viaje de innovación y crecimiento empresarial
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-8 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#6B1E22] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2009</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Los Inicios</h3>
                    <p className="text-gray-600">
                      Fundada como una iniciativa de la Cámara de Comercio de Guatemala para digitalizar
                      la gestión de eventos empresariales y facilitar el networking profesional.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#6B1E22] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2015</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Expansión Digital</h3>
                    <p className="text-gray-600">
                      Lanzamiento de la primera plataforma digital completa con sistema de pagos en línea
                      y gestión automatizada de certificados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#6B1E22] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2020</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Adaptación a la Nueva Era</h3>
                    <p className="text-gray-600">
                      Implementación de eventos híbridos y virtuales durante la pandemia,
                      consolidándonos como líderes en transformación digital.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#6B1E22] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2024</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">El Futuro Digital</h3>
                    <p className="text-gray-600">
                      Lanzamiento de TradeConnect 2.0 con IA integrada, blockchain para certificados
                      y una experiencia de usuario completamente renovada.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutPage