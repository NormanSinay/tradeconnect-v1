import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedInIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  MapPin as LocationIcon,
  Building as BusinessIcon,
} from 'lucide-react';

const Footer: React.FC = () => {
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
    { icon: <FacebookIcon className="h-5 w-5" />, href: 'https://facebook.com/tradeconnect', label: 'Facebook' },
    { icon: <TwitterIcon className="h-5 w-5" />, href: 'https://twitter.com/tradeconnect', label: 'Twitter' },
    { icon: <InstagramIcon className="h-5 w-5" />, href: 'https://instagram.com/tradeconnect', label: 'Instagram' },
    { icon: <LinkedInIcon className="h-5 w-5" />, href: 'https://linkedin.com/company/tradeconnect', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Link
                to="/"
                className="flex items-center space-x-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity mb-4"
              >
                <BusinessIcon className="h-7 w-7" />
                <span>TradeConnect</span>
              </Link>
              <p className="text-gray-300 text-sm mb-4">
                Plataforma E-commerce de Eventos y Cursos Empresariales con facturación FEL Guatemala.
                Conectamos empresas con profesionales para el desarrollo continuo.
              </p>
            </div>

            {/* Contact Info */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <EmailIcon className="h-4 w-4 text-primary mr-2" />
                <a
                  href="mailto:info@tradeconnect.gt"
                  className="text-white hover:text-primary transition-colors text-sm"
                >
                  info@tradeconnect.gt
                </a>
              </div>
              <div className="flex items-center mb-2">
                <PhoneIcon className="h-4 w-4 text-primary mr-2" />
                <a
                  href="tel:+50212345678"
                  className="text-white hover:text-primary transition-colors text-sm"
                >
                  +502 1234-5678
                </a>
              </div>
              <div className="flex items-start">
                <LocationIcon className="h-4 w-4 text-primary mr-2 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Ciudad de Guatemala, Guatemala
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">Síguenos</h3>
              <div className="flex space-x-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors p-2 rounded hover:bg-primary/10"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="font-semibold mb-4 text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-primary transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Newsletter Section */}
        <div className="text-center mb-8">
          <h3 className="text-primary font-semibold mb-4">Mantente informado</h3>
          <p className="text-gray-300 text-sm mb-4">
            Suscríbete a nuestro newsletter para recibir las últimas novedades sobre eventos y cursos.
          </p>
          <form className="flex justify-center max-w-md mx-auto gap-2">
            <Input
              type="email"
              placeholder="Tu email"
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Button type="submit" className="px-6">
              Suscribirse
            </Button>
          </form>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
          </p>

          <div className="flex space-x-6">
            <a
              href="/terms"
              className="text-gray-400 hover:text-primary transition-colors text-sm"
            >
              Términos
            </a>
            <a
              href="/privacy"
              className="text-gray-400 hover:text-primary transition-colors text-sm"
            >
              Privacidad
            </a>
            <span className="text-gray-400 text-sm">
              SAT/FEL Certificado
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;