/**
 * @fileoverview LanguageSelectorNew - Selector de idioma avanzado
 * @description Componente React para cambio de idioma con diseño moderno
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks y state management
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Selector de idioma con diseño moderno
 * - Indicador visual de idioma seleccionado
 * - Integración completa con sistema de traducción
 * - Compatibilidad SSR con Astro
 * - Diseño responsive con Tailwind CSS
 *
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { Languages, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'es', name: 'Español', flag: '🇬🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

/**
 * LanguageSelectorNew - Selector de idioma avanzado
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
const LanguageSelectorNew: React.FC = () => {
  const { changeLanguage, getCurrentLanguage } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  const currentLanguage = languages.find(
    (lang) => lang.code === getCurrentLanguage()
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-primary-600 transition-colors"
          aria-label="Cambiar idioma / Change language"
          title="Cambiar idioma / Change language"
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => {
          const isSelected = language.code === getCurrentLanguage();
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer flex items-center justify-between ${
                isSelected ? 'bg-primary-50 text-primary-700' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-primary-600" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelectorNew;
