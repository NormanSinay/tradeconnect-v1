import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();

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
    { icon: <FacebookIcon />, href: 'https://facebook.com/tradeconnect', label: 'Facebook' },
    { icon: <TwitterIcon />, href: 'https://twitter.com/tradeconnect', label: 'Twitter' },
    { icon: <InstagramIcon />, href: 'https://instagram.com/tradeconnect', label: 'Instagram' },
    { icon: <LinkedInIcon />, href: 'https://linkedin.com/company/tradeconnect', label: 'LinkedIn' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`,
        color: 'white',
        mt: 'auto',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  textDecoration: 'none',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                <BusinessIcon sx={{ fontSize: 28 }} />
                TradeConnect
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'grey.300' }}>
                Plataforma E-commerce de Eventos y Cursos Empresariales con facturación FEL Guatemala.
                Conectamos empresas con profesionales para el desarrollo continuo.
              </Typography>
            </Box>

            {/* Contact Info */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                <MuiLink
                  href="mailto:info@tradeconnect.gt"
                  color="inherit"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  info@tradeconnect.gt
                </MuiLink>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                <MuiLink
                  href="tel:+50212345678"
                  color="inherit"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  +502 1234-5678
                </MuiLink>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationIcon sx={{ mr: 1, mt: 0.5, fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2" color="grey.300">
                  Ciudad de Guatemala, Guatemala
                </Typography>
              </Box>
            </Box>

            {/* Social Links */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Síguenos
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'grey.400',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(107, 30, 34, 0.1)',
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <Grid item xs={6} sm={3} md={2} key={section.title}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                {section.title}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {section.items.map((item) => (
                  <Box component="li" key={item.label} sx={{ mb: 1 }}>
                    <MuiLink
                      component={Link}
                      to={item.href}
                      color="grey.300"
                      sx={{
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {item.label}
                    </MuiLink>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ bgcolor: 'grey.700', my: 3 }} />

        {/* Newsletter Section */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Mantente informado
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'grey.300' }}>
            Suscríbete a nuestro newsletter para recibir las últimas novedades sobre eventos y cursos.
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              maxWidth: 400,
              mx: 'auto',
              gap: 1,
            }}
          >
            <input
              type="email"
              placeholder="Tu email"
              style={{
                flex: 1,
                padding: '8px 16px',
                border: '1px solid #555',
                borderRadius: '4px',
                backgroundColor: '#333',
                color: 'white',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Suscribirse
            </button>
          </Box>
        </Box>

        <Divider sx={{ bgcolor: 'grey.700', my: 3 }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <MuiLink
              component={Link}
              to="/terms"
              color="grey.400"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Términos
            </MuiLink>
            <MuiLink
              component={Link}
              to="/privacy"
              color="grey.400"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Privacidad
            </MuiLink>
            <Typography variant="body2" color="grey.400" sx={{ fontSize: '0.875rem' }}>
              SAT/FEL Certificado
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;