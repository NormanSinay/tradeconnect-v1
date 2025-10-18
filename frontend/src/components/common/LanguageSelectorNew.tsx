import React from 'react';
import { FaLanguage, FaCheck } from 'react-icons/fa';
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
 * LanguageSelectorNew - Selector de idioma con dropdown
 * Migrado de MUI Menu a shadcn/ui DropdownMenu
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
          <FaLanguage className="h-5 w-5" />
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
                <FaCheck className="h-4 w-4 text-primary-600" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelectorNew;
