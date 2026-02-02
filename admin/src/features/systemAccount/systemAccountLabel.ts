import { SystemAccount } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function systemAccountLabel(systemAccount?: Partial<SystemAccount> | null, dictionary?: Dictionary) {
  const label = String(systemAccount?.id != null ? systemAccount.id : '');

  if (!systemAccount?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
