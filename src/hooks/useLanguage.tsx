/**
 * Language context and hooks for React components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { languageService, Language, Translation } from '@/lib/languageService';

interface LanguageContextType {
  currentLanguage: string;
  translations: Translation;
  availableLanguages: Language[];
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(languageService.getCurrentLanguage());
  const [translations, setTranslations] = useState<Translation>({});
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setIsLoading(true);
        await languageService.initialize();
        
        setCurrentLanguage(languageService.getCurrentLanguage());
        setTranslations(languageService.translations);
        setAvailableLanguages(languageService.getAvailableLanguagesSync());
      } catch (error) {
        console.error('Failed to initialize language service:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
      setTranslations(languageService.translations);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const changeLanguage = async (languageCode: string) => {
    try {
      await languageService.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setTranslations(languageService.translations);
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  };

  const t = (key: string, fallback?: string): string => {
    return languageService.t(key, fallback);
  };

  const value: LanguageContextType = {
    currentLanguage,
    translations,
    availableLanguages,
    changeLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Higher-order component for easy translation
export const withTranslation = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { t } = useLanguage();
    return <Component {...props} t={t} />;
  };
};

// Hook for getting translated text
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};

// Hook for language switching
export const useLanguageSwitcher = () => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  
  return {
    currentLanguage,
    availableLanguages,
    changeLanguage
  };
};
