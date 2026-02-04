import { Trade } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function tradeLabel(trade?: Partial<Trade> | null, dictionary?: Dictionary) {
  const label = String(trade?.id != null ? trade.id : '');

  if (!trade?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
