import { defaultLocale, Locale } from 'src/translation/locales';
import de from './de/de';
import en from './en/en';
import es from './es/es';
import ptBR from './pt-BR/ptBR';

export const dictionaries = {
  en: en,
  de: de,
  es: es,
  'pt-BR': ptBR,
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]
    ? dictionaries[locale]
    : dictionaries[defaultLocale];
}

export async function isDictionaryValid(locale: string) {
  return (dictionaries as any)[locale] ? true : false;
}
