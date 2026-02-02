import { TradeFill } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function tradeFillLabel(tradeFill?: Partial<TradeFill> | null, dictionary?: Dictionary) {
  const label = String(tradeFill?.id != null ? tradeFill.id : '');

  if (!tradeFill?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
