import { Deposit } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function depositLabel(deposit?: Partial<Deposit> | null, dictionary?: Dictionary) {
  const label = String(deposit?.id != null ? deposit.id : '');

  if (!deposit?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
