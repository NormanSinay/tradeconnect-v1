import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que automáticamente hace scroll al top cuando cambia la ruta
 * Se debe colocar dentro del BrowserRouter
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll suave al top de la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;