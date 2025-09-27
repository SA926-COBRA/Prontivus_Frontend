/**
 * Language switcher component
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguageSwitcher } from '@/hooks/useLanguage';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showLabel = true,
  variant = 'default'
}) => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguageSwitcher();

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

  if (variant === 'minimal') {
    return (
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-auto ${className}`}>
          <Globe className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {getLanguageDisplayName(language)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Globe className="h-4 w-4 text-gray-500" />
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {getLanguageDisplayName(language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Globe className="h-4 w-4 text-gray-500" />
      {showLabel && (
        <span className="text-sm text-gray-600">
          {availableLanguages.find(lang => lang.code === 'pt-BR')?.native_name === 'Português (Brasil)' 
            ? 'Idioma:' 
            : 'Language:'}
        </span>
      )}
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {getLanguageDisplayName(language)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
