import dictionary from 'src/translation/en/en';

export type Locale = 'en' | 'es' | 'de' | 'pt-BR';
export const defaultLocale = process.env.NEXT_PUBLIC_LOCALE as Locale || 'en';
export const locales: Locale[] = ['en', 'de', 'pt-BR', 'es'];
export type Dictionary = typeof dictionary;
