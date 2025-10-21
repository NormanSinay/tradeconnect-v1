import React, { useState } from 'react'
import { FaMobileAlt, FaQrcode, FaDownload, FaApple, FaAndroid, FaCheckCircle, FaStar, FaUsers, FaShieldAlt, FaBolt } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const AppDownloadPage: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | null>(null)

  const handleDownload = (platform: 'ios' | 'android') => {
    // In a real app, this would redirect to the app store
    if (platform === 'ios') {
      window.open('https://apps.apple.com/app/tradeconnect-qr/id123456789', '_blank')
    } else {
      window.open('https://play.google.com/store/apps/details?id=gt.camaradecomercio.tradeconnect', '_blank')
    }
  }

  const features = [
    {
      icon: <FaQrcode className="h-6 w-6" />,
      title: 'Escaneo QR Rápido',
      description: 'Escanea códigos QR de eventos de forma instantánea con la cámara de tu dispositivo.'
    },
    {
      icon: <FaCheckCircle className="h-6 w-6" />,
      title: 'Check-in Automático',
      description: 'Registra tu asistencia a eventos con un solo toque. Sin filas ni esperas.'
    },
    {
      icon: <FaUsers className="h-6 w-6" />,
      title: 'Networking Digital',
      description: 'Conecta con otros participantes y speakers durante y después de los eventos.'
    },
    {
      icon: <FaShieldAlt className="h-6 w-6" />,
      title: 'Certificados Digitales',
      description: 'Accede y comparte tus certificados de participación desde cualquier lugar.'
    },
    {
      icon: <FaBolt className="h-6 w-6" />,
      title: 'Notificaciones en Tiempo Real',
      description: 'Recibe actualizaciones sobre eventos, cambios de horario y recordatorios importantes.'
    },
    {
      icon: <FaMobileAlt className="h-6 w-6" />,
      title: 'Experiencia Móvil Optimizada',
      description: 'Diseñada específicamente para dispositivos móviles con interfaz intuitiva.'
    }
  ]

  const testimonials = [
    {
      name: 'María González',
      role: 'Emprendedora',
      content: 'La app de TradeConnect revolucionó mi forma de asistir a eventos. El check-in es instantáneo y los certificados están siempre disponibles.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Profesional IT',
      content: 'Como speaker, aprecio mucho la facilidad para conectar con la audiencia. La app hace que todo el proceso sea fluido.',
      rating: 5
    },
    {
      name: 'Ana López',
      role: 'Directora de Recursos Humanos',
      content: 'Excelente herramienta para gestión de capacitaciones. Los reportes de asistencia son muy útiles para nuestro equipo.',
      rating: 5
    }
  ]

  const stats = [
    { number: '10K+', label: 'Descargas' },
    { number: '500+', label: 'Eventos Registrados' },
    { number: '4.8', label: 'Calificación' },
    { number: '99%', label: 'Tiempo Activo' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center">
              <FaMobileAlt className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-6">
            TradeConnect QR
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            La app móvil oficial de la Cámara de Comercio para una experiencia completa
            en eventos, conferencias y talleres. Escanea, conecta y certifica tu participación.
          </p>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => handleDownload('ios')}
            >
              <FaApple className="mr-2 h-5 w-5" />
              Descargar para iOS
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => handleDownload('android')}
            >
              <FaAndroid className="mr-2 h-5 w-5" />
              Descargar para Android
            </Button>
          </div>

          {/* QR Code Preview */}
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-2xl">
              <div className="text-center mb-4">
                <FaQrcode className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Escanea para descargar</p>
              </div>
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaQrcode className="h-16 w-16 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre todas las funcionalidades que hacen de TradeConnect QR
              la app indispensable para eventos profesionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600">
              Tres pasos simples para una experiencia completa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Descarga la App</h3>
              <p className="text-gray-600">
                Disponible gratis en App Store y Google Play.
                Compatible con iOS y Android.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Regístrate en Eventos</h3>
              <p className="text-gray-600">
                Inscríbete en conferencias, talleres y eventos desde la plataforma web.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Escanea y Participa</h3>
              <p className="text-gray-600">
                Usa la app para check-in, networking y obtener tus certificados digitales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshots */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Capturas de Pantalla
            </h2>
            <p className="text-xl text-gray-600">
              Una interfaz intuitiva diseñada para profesionales
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-md">
                <div className="aspect-[9/16] bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <FaMobileAlt className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="font-semibold text-center">Pantalla {i}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Miles de profesionales ya confían en TradeConnect QR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="h-4 w-4 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para revolucionar tu experiencia en eventos?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Descarga TradeConnect QR ahora y únete a la comunidad de profesionales
            que ya transformaron su forma de participar en eventos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => handleDownload('ios')}
            >
              <FaApple className="mr-2 h-5 w-5" />
              App Store
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => handleDownload('android')}
            >
              <FaAndroid className="mr-2 h-5 w-5" />
              Google Play
            </Button>
          </div>

          <p className="text-sm mt-6 opacity-75">
            Gratuita para descargar • Compatible con iOS 12+ y Android 8+
          </p>
        </div>
      </div>

      {/* Compatibility Notice */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">
            TradeConnect QR es compatible con iPhone, iPad, teléfonos y tablets Android.
            Requiere conexión a internet para funcionalidades completas.
          </p>
        </div>
      </div>
    </div>
  )
}