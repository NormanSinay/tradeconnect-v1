import { useState, useEffect } from 'react';

/**
 * Custom hook to handle media queries in React
 * Replacement for MUI's useMediaQuery hook
 *
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks based on Tailwind defaults
 */

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsSmallScreen() {
  return useMediaQuery('(max-width: 639px)'); // sm
}

export function useIsMediumScreen() {
  return useMediaQuery('(min-width: 768px)'); // md
}

export function useIsLargeScreen() {
  return useMediaQuery('(min-width: 1024px)'); // lg
}

export function useIsExtraLargeScreen() {
  return useMediaQuery('(min-width: 1280px)'); // xl
}

export function useIs2ExtraLargeScreen() {
  return useMediaQuery('(min-width: 1536px)'); // 2xl
}
