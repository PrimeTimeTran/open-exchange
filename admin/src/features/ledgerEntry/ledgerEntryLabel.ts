import { LedgerEntry } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function ledgerEntryLabel(ledgerEntry?: Partial<LedgerEntry> | null, dictionary?: Dictionary) {
  const label = String(ledgerEntry?.id != null ? ledgerEntry.id : '');

  if (!ledgerEntry?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
