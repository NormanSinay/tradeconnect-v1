/**
 * @fileoverview Contact Page component for TradeConnect Frontend
 * @description

 * @architecture
 * - React: Componentes interactivos con hooks y context
 * - Astro: Routing y Server-Side Rendering (SSR)
 * - shadcn/ui: Componentes UI preconstruidos
 * - Tailwind CSS: Sistema de estilos utilitarios
 * - Radix UI: Primitivos accesibles para componentes
 * - React Icons: Biblioteca de iconos
 *
 * @compatibility SSR: Compatible con Astro SSR
 * @compatibility React: Compatible con React 18+
 * @compatibility TypeScript: Tipos completos incluidos
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Building,
  HeadphonesIcon,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitMessage('¡Mensaje enviado exitosamente! Te responderemos en las próximas 24 horas.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
      });
    } catch (error) {
      setSubmitMessage('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="h-10 w-10 text-primary" />,
      title: 'Email',
      description: 'Respuesta en menos de 24 horas',
      contact: 'info@tradeconnect.gt',
      action: 'mailto:info@tradeconnect.gt',
    },
    {
      icon: <Phone className="h-10 w-10 text-primary" />,
      title: 'Teléfono',
      description: 'Lunes a Viernes, 8:00 - 17:00',
      contact: '+502 1234-5678',
      action: 'tel:+50212345678',
    },
    {
      icon: <HeadphonesIcon className="h-10 w-10 text-primary" />,
      title: 'Chat en Vivo',
      description: 'Soporte instantáneo',
      contact: 'Disponible ahora',
      action: '#',
    },
  ];

  const departments = [
    {
      icon: <Building className="h-7 w-7 text-primary" />,
      title: 'Ventas Empresariales',
      description: 'Soluciones para empresas y equipos grandes',
      email: 'ventas@tradeconnect.gt',
    },
    {
      icon: <HeadphonesIcon className="h-7 w-7 text-primary" />,
      title: 'Soporte Técnico',
      description: 'Ayuda con problemas técnicos y plataforma',
      email: 'soporte@tradeconnect.gt',
    },
    {
      icon: <AlertTriangle className="h-7 w-7 text-primary" />,
      title: 'Reportar Problemas',
      description: 'Incidentes de seguridad y bugs',
      email: 'seguridad@tradeconnect.gt',
    },
  ];

  return (
    <div className="min-h-screen py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16 mb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 font-montserrat">
            Contáctanos
          </h1>
          <p className="text-lg md:text-xl text-center opacity-90 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Elige la mejor forma de contactarnos
            o envíanos un mensaje directamente.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index} className="h-full text-center transition-transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{method.title}</h3>
                <p className="text-muted-foreground mb-3">{method.description}</p>
                <p className="font-medium mb-4">{method.contact}</p>
                <Button variant="outline" asChild className="min-w-[120px]">
                  <a href={method.action}>Contactar</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Envíanos un Mensaje</h2>

              {submitMessage && (
                <Alert className="mb-4" variant={submitMessage.includes('exitosamente') ? 'default' : 'destructive'}>
                  <AlertDescription>{submitMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder="Nombre completo"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder="Asunto"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Select value={formData.category} onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Consulta General</SelectItem>
                        <SelectItem value="support">Soporte Técnico</SelectItem>
                        <SelectItem value="sales">Ventas</SelectItem>
                        <SelectItem value="billing">Facturación</SelectItem>
                        <SelectItem value="partnership">Alianzas</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Textarea
                    placeholder="Describe tu consulta o problema en detalle..."
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[200px] py-3 text-lg"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Departments & Office Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Departamentos</h3>

              {departments.map((dept, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex items-center mb-2">
                    {dept.icon}
                    <h4 className="ml-3 font-semibold">{dept.title}</h4>
                  </div>
                  <p className="text-muted-foreground mb-1">{dept.description}</p>
                  <p className="font-medium">{dept.email}</p>
                  {index < departments.length - 1 && <hr className="mt-4" />}
                </div>
              ))}
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Oficina Central</h3>

              <div className="flex items-start mb-4">
                <MapPin className="mr-3 mt-1 h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Ciudad de Guatemala</p>
                  <p className="text-muted-foreground text-sm">
                    Zona 10, Centro Empresarial<br />
                    Torre Internacional, Nivel 15<br />
                    Guatemala, C.A.
                  </p>
                </div>
              </div>

              <hr className="my-4" />

              <h4 className="font-semibold mb-3">Horarios de Atención</h4>
              <p className="text-sm mb-1">
                <strong>Lunes - Viernes:</strong> 8:00 - 17:00
              </p>
              <p className="text-sm mb-1">
                <strong>Sábados:</strong> 9:00 - 13:00
              </p>
              <p className="text-sm">
                <strong>Domingos:</strong> Cerrado
              </p>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">¿Necesitas ayuda inmediata?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Revisa nuestro centro de ayuda para encontrar respuestas rápidas a preguntas comunes,
            o explora nuestras guías detalladas para aprovechar al máximo TradeConnect.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="outline" size="lg" asChild>
              <a href="/help">Centro de Ayuda</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/faq">Preguntas Frecuentes</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;