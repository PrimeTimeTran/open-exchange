import { Account } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function accountLabel(account?: Partial<Account> | null, dictionary?: Dictionary) {
  const label = String(account?.id != null ? account.id : '');

  if (!account?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
