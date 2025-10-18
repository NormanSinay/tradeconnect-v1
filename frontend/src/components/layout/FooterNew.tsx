import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FooterNew: React.FC = () => {
  const footerSections = [
    {
      title: 'TradeConnect',
      items: [
        { label: 'Sobre nosotros', href: '/about' },
        { label: 'Cómo funciona', href: '/how-it-works' },
        { label: 'Para organizadores', href: '/organizers' },
        { label: 'Para empresas', href: '/business' },
      ],
    },
    {
      title: 'Eventos',
      items: [
        { label: 'Catálogo completo', href: '/events' },
        { label: 'Eventos destacados', href: '/events?featured=true' },
        { label: 'Próximos eventos', href: '/events?upcoming=true' },
        { label: 'Eventos virtuales', href: '/events?type=virtual' },
      ],
    },
    {
      title: 'Soporte',
      items: [
        { label: 'Centro de ayuda', href: '/help' },
        { label: 'Preguntas frecuentes', href: '/faq' },
        { label: 'Contactanos', href: '/contact' },
        { label: 'Reportar problema', href: '/report-issue' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Términos de servicio', href: '/terms' },
        { label: 'Política de privacidad', href: '/privacy' },
        { label: 'Política de cookies', href: '/cookies' },
        { label: 'Facturación FEL', href: '/fel-info' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com/tradeconnect', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com/tradeconnect', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com/tradeconnect', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://linkedin.com/company/tradeconnect', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-auto py-12">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand Section - Takes 4 columns on md+ */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <a
                href="/"
                className="flex items-center gap-2 text-primary-400 font-bold text-xl mb-4 hover:text-primary-300 transition-colors no-underline"
              >
                <FaBriefcase className="text-2xl" />
                TradeConnect
              </a>
              <p className="text-sm text-gray-300 mb-4">
                Plataforma E-commerce de Eventos y Cursos Empresariales con facturación FEL Guatemala.
                Conectamos empresas con profesionales para el desarrollo continuo.
              </p>
            </div>

            {/* Contact Info */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center">
                <FaEnvelope className="mr-2 text-sm text-primary-400" />
                <a
                  href="mailto:info@tradeconnect.gt"
                  className="text-sm text-gray-300 hover:text-primary-400 transition-colors no-underline"
                >
                  info@tradeconnect.gt
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-2 text-sm text-primary-400" />
                <a
                  href="tel:+50212345678"
                  className="text-sm text-gray-300 hover:text-primary-400 transition-colors no-underline"
                >
                  +502 1234-5678
                </a>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="mr-2 mt-1 text-sm text-primary-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">
                  Ciudad de Guatemala, Guatemala
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-bold mb-2">Síguenos</h3>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-primary-400 hover:bg-primary-900/10 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="text-lg" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links - Each takes 2 columns on md+ */}
          {footerSections.map((section) => (
            <div key={section.title} className="md:col-span-2">
              <h3 className="text-sm font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-300 hover:text-primary-400 hover:underline transition-colors no-underline"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-gray-700 my-6" />

        {/* Newsletter Section */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2 text-primary-400">Mantente informado</h3>
          <p className="text-sm text-gray-300 mb-4">
            Suscríbete a nuestro newsletter para recibir las últimas novedades sobre eventos y cursos.
          </p>
          <form className="flex max-w-md mx-auto gap-2">
            <Input
              type="email"
              placeholder="Tu email"
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-primary-500"
            />
            <Button type="submit" variant="default">
              Suscribirse
            </Button>
          </form>
        </div>

        <hr className="border-gray-700 my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
          </p>

          <div className="flex gap-6">
            <a
              href="/terms"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors no-underline"
            >
              Términos
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors no-underline"
            >
              Privacidad
            </a>
            <span className="text-sm text-gray-400">SAT/FEL Certificado</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterNew;
