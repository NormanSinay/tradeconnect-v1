import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'react-hot-toast'

// Validation schema
const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(100, 'El asunto no puede tener más de 100 caracteres'),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede tener más de 1000 caracteres'),
  phone: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export const ContactPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsLoading(true)

      // In a real app, you would call your API here
      // const response = await api.post('/contact', data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('¡Mensaje enviado exitosamente! Te responderemos pronto.')
      form.reset()
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="h-5 w-5" />,
      title: 'Dirección',
      content: 'Calle Principal #123, Zona 1, Ciudad de Guatemala',
      details: 'Frente al Parque Nacional, Edificio Corporativo'
    },
    {
      icon: <FaPhone className="h-5 w-5" />,
      title: 'Teléfono',
      content: '+502 2222-3333',
      details: 'Lunes a Viernes, 8:00 AM - 6:00 PM'
    },
    {
      icon: <FaEnvelope className="h-5 w-5" />,
      title: 'Email',
      content: 'info@camaradecomercio.gt',
      details: 'Respuesta en menos de 24 horas'
    },
    {
      icon: <FaClock className="h-5 w-5" />,
      title: 'Horario de Atención',
      content: 'Lunes - Viernes: 8:00 - 18:00',
      details: 'Sábados: 9:00 - 13:00, Domingos: Cerrado'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta sobre eventos,
            membresía o servicios de la Cámara de Comercio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaPaperPlane className="mr-2 h-5 w-5" />
                Envíanos un Mensaje
              </CardTitle>
              <CardDescription>
                Completa el formulario y te responderemos lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tu nombre completo"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono (Opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+502 5555-5555"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="¿En qué podemos ayudarte?"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu consulta o solicitud..."
                            className="min-h-[120px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {info.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-gray-900 font-medium mb-1">
                        {info.content}
                      </p>
                      <p className="text-sm text-gray-600">
                        {info.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Map Placeholder */}
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Mapa interactivo próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>¿Necesitas Ayuda Inmediata?</CardTitle>
              <CardDescription>
                Revisa nuestras preguntas frecuentes o explora otros recursos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div>
                    <div className="font-semibold">Preguntas Frecuentes</div>
                    <div className="text-sm text-gray-600">Encuentra respuestas rápidas</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div>
                    <div className="font-semibold">Centro de Ayuda</div>
                    <div className="text-sm text-gray-600">Guías y tutoriales</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div>
                    <div className="font-semibold">Chat en Vivo</div>
                    <div className="text-sm text-gray-600">Atención inmediata</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}