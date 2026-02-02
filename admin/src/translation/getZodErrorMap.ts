import zodEn from './en/zodEn';
import zodEs from './es/zodEs';
import zodDe from './de/zodDe';
import zodPtBr from './pt-BR/zodPtBr';
import { defaultLocale, Locale } from 'src/translation/locales';

export const zodErrorMaps = {
  en: zodEn,
  es: zodEs,
  de: zodDe,
  'pt-BR': zodPtBr,
};

export function getZodErrorMap(locale: Locale) {
  return zodErrorMaps[locale]
    ? zodErrorMaps[locale]
    : zodErrorMaps[defaultLocale];
}
