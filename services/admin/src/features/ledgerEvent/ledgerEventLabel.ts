import { LedgerEvent } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function ledgerEventLabel(ledgerEvent?: Partial<LedgerEvent> | null, dictionary?: Dictionary) {
  const label = String(ledgerEvent?.id != null ? ledgerEvent.id : '');

  if (!ledgerEvent?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
