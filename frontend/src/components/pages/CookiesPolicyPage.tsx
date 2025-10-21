import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaCookieBite, FaToggleOn, FaToggleOff, FaInfoCircle } from 'react-icons/fa'

export const CookiesPolicyPage: React.FC = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    marketing: false,
    functional: true,
  })

  const cookieTypes = [
    {
      id: 'essential',
      title: 'Cookies Esenciales',
      description: 'Necesarias para el funcionamiento básico del sitio web',
      required: true,
      examples: ['Autenticación de usuario', 'Carrito de compras', 'Navegación segura'],
      impact: 'El sitio no funcionará correctamente sin estas cookies'
    },
    {
      id: 'analytics',
      title: 'Cookies de Analytics',
      description: 'Nos ayudan a entender cómo los visitantes usan nuestro sitio',
      required: false,
      examples: ['Páginas visitadas', 'Tiempo en el sitio', 'Origen del tráfico'],
      impact: 'No podremos mejorar la experiencia del usuario'
    },
    {
      id: 'functional',
      title: 'Cookies Funcionales',
      description: 'Mejoran la funcionalidad y personalización del sitio',
      required: false,
      examples: ['Idioma preferido', 'Configuración de accesibilidad', 'Recordar preferencias'],
      impact: 'Algunas funciones personalizadas no estarán disponibles'
    },
    {
      id: 'marketing',
      title: 'Cookies de Marketing',
      description: 'Usadas para mostrar anuncios relevantes y medir su efectividad',
      required: false,
      examples: ['Publicidad personalizada', 'Seguimiento de conversiones', 'Remarketing'],
      impact: 'Verás anuncios menos relevantes'
    }
  ]

  const handlePreferenceChange = (cookieType: string, enabled: boolean) => {
    if (cookieType === 'essential') return // Essential cookies cannot be disabled

    setCookiePreferences(prev => ({
      ...prev,
      [cookieType]: enabled
    }))
  }

  const savePreferences = () => {
    // In a real app, you would save these preferences to localStorage and/or backend
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences))
    alert('Preferencias de cookies guardadas exitosamente')
  }

  const acceptAllCookies = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setCookiePreferences(allEnabled)
    localStorage.setItem('cookiePreferences', JSON.stringify(allEnabled))
  }

  const rejectAllNonEssential = () => {
    const minimalEnabled = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    setCookiePreferences(minimalEnabled)
    localStorage.setItem('cookiePreferences', JSON.stringify(minimalEnabled))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCookieBite className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Cookies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Utilizamos cookies para mejorar tu experiencia en TradeConnect.
            Controla qué cookies aceptas y cómo utilizamos tu información.
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={acceptAllCookies} className="flex-1">
                Aceptar Todas las Cookies
              </Button>
              <Button onClick={rejectAllNonEssential} variant="outline" className="flex-1">
                Solo Cookies Esenciales
              </Button>
              <Button onClick={savePreferences} variant="secondary" className="flex-1">
                Guardar Preferencias
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          {cookieTypes.map((cookieType) => (
            <Card key={cookieType.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <FaCookieBite className="mr-2 h-5 w-5 text-orange-500" />
                    {cookieType.title}
                    {cookieType.required && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Requerido
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {cookiePreferences[cookieType.id as keyof typeof cookiePreferences] ? 'Activado' : 'Desactivado'}
                    </span>
                    {cookieType.required ? (
                      <FaToggleOn className="h-6 w-6 text-green-500" />
                    ) : (
                      <button
                        onClick={() => handlePreferenceChange(
                          cookieType.id,
                          !cookiePreferences[cookieType.id as keyof typeof cookiePreferences]
                        )}
                        className="focus:outline-none"
                      >
                        {cookiePreferences[cookieType.id as keyof typeof cookiePreferences] ? (
                          <FaToggleOn className="h-6 w-6 text-green-500" />
                        ) : (
                          <FaToggleOff className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{cookieType.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Ejemplos:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {cookieType.examples.map((example, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Impacto si se desactiva:</h4>
                    <p className="text-sm text-gray-600">{cookieType.impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaInfoCircle className="mr-2 h-5 w-5" />
                ¿Qué son las Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas
                nuestro sitio web. Nos permiten recordar tus preferencias, analizar el uso del sitio y
                proporcionar una experiencia personalizada.
              </p>
              <p>
                Las cookies no contienen información personal identificable por sí mismas, pero pueden
                combinarse con otros datos para crear perfiles de usuario.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Cookies en tu Navegador</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                También puedes controlar las cookies a través de la configuración de tu navegador web:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold">Chrome:</h4>
                  <p className="text-sm">Configuración → Privacidad → Cookies</p>
                </div>
                <div>
                  <h4 className="font-semibold">Firefox:</h4>
                  <p className="text-sm">Preferencias → Privacidad → Cookies</p>
                </div>
                <div>
                  <h4 className="font-semibold">Safari:</h4>
                  <p className="text-sm">Preferencias → Privacidad → Gestionar datos</p>
                </div>
                <div>
                  <h4 className="font-semibold">Edge:</h4>
                  <p className="text-sm">Configuración → Cookies y permisos</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                <strong>Nota:</strong> Desactivar las cookies esenciales puede afectar el funcionamiento
                del sitio web.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Cuánto Tiempo se Almacenan las Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul>
                <li><strong>Cookies de sesión:</strong> Se eliminan cuando cierras el navegador</li>
                <li><strong>Cookies persistentes:</strong> Permanecen hasta su fecha de expiración o eliminación manual</li>
                <li><strong>Cookies de autenticación:</strong> Generalmente expiran después de 30 días de inactividad</li>
                <li><strong>Cookies de preferencias:</strong> Pueden durar hasta 1 año</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies de Terceros</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Utilizamos servicios de terceros que pueden instalar sus propias cookies:
              </p>
              <ul>
                <li><strong>Google Analytics:</strong> Para análisis de uso del sitio</li>
                <li><strong>Stripe/PayPal:</strong> Para procesamiento de pagos seguros</li>
                <li><strong>Redes sociales:</strong> Para compartir contenido e integraciones</li>
                <li><strong>Servicios de hosting:</strong> Para entrega de contenido optimizada</li>
              </ul>
              <p>
                Estos terceros tienen sus propias políticas de cookies y privacidad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actualizaciones de esta Política</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en
                nuestras prácticas o por requerimientos legales. Te notificaremos sobre cambios
                significativos.
              </p>
              <p>
                La fecha de la última actualización se muestra en la parte superior de esta página.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>¿Preguntas sobre Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Si tienes preguntas sobre nuestra política de cookies o cómo manejamos tu información,
              no dudes en contactarnos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                Contactar Soporte
              </Button>
              <Button variant="outline" className="flex-1">
                Ver Política de Privacidad
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}