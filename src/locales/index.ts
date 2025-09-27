/**
 * Locale index file
 */

import { ptBR } from './pt-BR';
import { enUS } from './en-US';
import { esES } from './es-ES';

export const locales = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};

export type LocaleKey = keyof typeof locales;
export type TranslationKey = keyof typeof ptBR;

export { ptBR, enUS, esES };
