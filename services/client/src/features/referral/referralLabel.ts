import { Referral } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function referralLabel(referral?: Partial<Referral> | null, dictionary?: Dictionary) {
  const label = String(referral?.id != null ? referral.id : '');

  if (!referral?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
