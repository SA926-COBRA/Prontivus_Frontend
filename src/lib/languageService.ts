/**
 * Language and translation service for frontend
 */

import axios from 'axios';

export interface Language {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface Translation {
  [key: string]: string;
}

export interface LanguageTranslationResponse {
  language_code: string;
  translations: Translation;
}

class LanguageService {
  private api: typeof axios;
  private currentLanguage: string = 'pt-BR';
  private translations: Translation = {};
  private availableLanguages: Language[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://prontivus-backend-pa1e.onrender.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load language preference from localStorage
    this.loadLanguagePreference();
  }

  /**
   * Load language preference from localStorage
   */
  private loadLanguagePreference(): void {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
  }

  /**
   * Save language preference to localStorage
   */
  private saveLanguagePreference(languageCode: string): void {
    localStorage.setItem('language', languageCode);
    this.currentLanguage = languageCode;
  }

  /**
   * Get available languages
   */
  async getAvailableLanguages(): Promise<Language[]> {
    try {
      const response = await this.api.get('/api/v1/language/languages');
      this.availableLanguages = response.data;
      return this.availableLanguages;
    } catch (error) {
      console.warn('Failed to fetch available languages from API, using fallback:', error);
      // Return default languages if API fails
      const fallbackLanguages = [
        {
          id: 1,
          code: 'pt-BR',
          name: 'Portuguese (Brazil)',
          native_name: 'Português (Brasil)',
          is_active: true,
          is_default: true,
          sort_order: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          code: 'en-US',
          name: 'English (US)',
          native_name: 'English (US)',
          is_active: true,
          is_default: false,
          sort_order: 2,
          created_at: new Date().toISOString()
        }
      ];
      this.availableLanguages = fallbackLanguages;
      return fallbackLanguages;
    }
  }

  /**
   * Get translations for a specific language
   */
  async getTranslations(languageCode: string): Promise<Translation> {
    try {
      const response = await this.api.get(`/api/v1/language/translations/${languageCode}`);
      return response.data.translations;
    } catch (error) {
      console.warn(`Failed to fetch translations for ${languageCode} from API, using fallback:`, error);
      // Load fallback translations
      return await this.getFallbackTranslations();
    }
  }

  /**
   * Load translations for current language
   */
  async loadTranslations(): Promise<void> {
    try {
      this.translations = await this.getTranslations(this.currentLanguage);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Load fallback translations
      this.translations = await this.getFallbackTranslations();
    }
  }

  /**
   * Get fallback translations (hardcoded)
   */
  private async getFallbackTranslations(): Promise<Translation> {
    // Import local translation files
    const { locales } = await import('@/locales');
    
    // Return translations for current language or default to Portuguese
    return locales[this.currentLanguage as keyof typeof locales] || locales['pt-BR'];
  }

  /**
   * Translate a key
   */
  t(key: string, fallback?: string): string {
    return this.translations[key] || fallback || key;
  }

  /**
   * Change language
   */
  async changeLanguage(languageCode: string): Promise<void> {
    try {
      // Save preference to backend if user is authenticated
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await this.api.post('/api/v1/language/user-preferences', null, {
            params: { language_code: languageCode },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.warn('Failed to save language preference to backend:', error);
        }
      }

      // Save to localStorage
      this.saveLanguagePreference(languageCode);

      // Load new translations
      await this.loadTranslations();

      // Dispatch language change event
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: languageCode }
      }));

    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguagesSync(): Language[] {
    return this.availableLanguages;
  }

  /**
   * Initialize language service
   */
  async initialize(): Promise<void> {
    try {
      // Load available languages
      await this.getAvailableLanguages();
      
      // Load translations for current language
      await this.loadTranslations();
      
      console.log(`Language service initialized with language: ${this.currentLanguage}`);
    } catch (error) {
      console.error('Failed to initialize language service:', error);
      // Initialize with fallback
      this.translations = await this.getFallbackTranslations();
    }
  }
}

// Create singleton instance
export const languageService = new LanguageService();

// Export types
export type { Language, Translation, LanguageTranslationResponse };
