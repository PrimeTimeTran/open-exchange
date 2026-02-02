import { Wallet } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function walletLabel(wallet?: Partial<Wallet> | null, dictionary?: Dictionary) {
  const label = String(wallet?.id != null ? wallet.id : '');

  if (!wallet?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
