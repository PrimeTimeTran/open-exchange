import dayjs from 'dayjs';
import { Locale } from 'src/translation/locales';

export function applyDayjsTranslation(locale: Locale) {
  if (locale === 'en') {
    return;
  }

  if (locale === 'es') {
    dayjs.locale(require('dayjs/locale/es'));
  }

  if (locale === 'de') {
    dayjs.locale(require('dayjs/locale/de'));
  }

  if (locale === 'pt-BR') {
    dayjs.locale(require('dayjs/locale/pt-br'));
  }
}
