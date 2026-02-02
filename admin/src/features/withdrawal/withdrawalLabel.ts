import { Withdrawal } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function withdrawalLabel(withdrawal?: Partial<Withdrawal> | null, dictionary?: Dictionary) {
  const label = String(withdrawal?.id != null ? withdrawal.id : '');

  if (!withdrawal?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
