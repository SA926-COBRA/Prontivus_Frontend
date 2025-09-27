/**
 * Enhanced Language Switcher Component
 * Provides a user-friendly dropdown for switching between English and Brazilian Portuguese
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useLanguageSwitcher, useTranslation } from '@/hooks/useLanguage';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'minimal';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'default',
  showLabel = true,
  className = ''
}) => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguageSwitcher();
  const { t } = useTranslation();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getLanguageDisplayName = (language: any) => {
    return language.native_name || language.name;
  };

  const getCurrentLanguageDisplayName = () => {
    const current = availableLanguages.find(lang => lang.code === currentLanguage);
    return current ? getLanguageDisplayName(current) : currentLanguage;
  };

  const getLanguageFlag = (code: string) => {
    switch (code) {
      case 'pt-BR':
        return '🇧🇷';
      case 'en-US':
        return '🇺🇸';
      case 'es-ES':
        return '🇪🇸';
      default:
        return '🌐';
    }
  };

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`w-8 h-8 p-0 ${className}`}>
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span>{getLanguageFlag(language.code)}</span>
                <span>{getLanguageDisplayName(language)}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`flex items-center space-x-2 ${className}`}>
            <Globe className="h-4 w-4" />
            <span className="text-sm">{getCurrentLanguageDisplayName()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span>{getLanguageFlag(language.code)}</span>
                <span>{getLanguageDisplayName(language)}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`flex items-center space-x-2 ${className}`}>
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="text-sm text-gray-600">
              {t('common.language', 'Language')}:
            </span>
          )}
          <span className="text-sm font-medium">
            {getCurrentLanguageDisplayName()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getLanguageFlag(language.code)}</span>
              <div className="flex flex-col">
                <span className="font-medium">{getLanguageDisplayName(language)}</span>
                <span className="text-xs text-gray-500">{language.name}</span>
              </div>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
