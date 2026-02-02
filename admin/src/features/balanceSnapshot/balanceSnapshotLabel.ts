import { BalanceSnapshot } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function balanceSnapshotLabel(balanceSnapshot?: Partial<BalanceSnapshot> | null, dictionary?: Dictionary) {
  const label = String(balanceSnapshot?.id != null ? balanceSnapshot.id : '');

  if (!balanceSnapshot?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
