import { Locale } from 'src/translation/locales';

export function formatDecimal(
  value: string | undefined | null,
  locale: Locale,
  maximumFractionDigits?: number,
) {
  if (!value) {
    return '';
  }

  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(
    parseFloat(value),
  );
}
