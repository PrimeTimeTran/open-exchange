import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookieGet } from 'src/shared/lib/cookie';
import { Locale, defaultLocale, locales } from 'src/translation/locales';

export function getLocaleFromCookies(cookies: ReadonlyRequestCookies) {
  const locale = cookieGet(cookies, 'locale') as Locale;

  if (locales.includes(locale)) {
    return locale;
  }

  return defaultLocale;
}
