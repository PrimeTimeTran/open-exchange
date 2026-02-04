import { FeeSchedule } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function feeScheduleLabel(feeSchedule?: Partial<FeeSchedule> | null, dictionary?: Dictionary) {
  const label = String(feeSchedule?.id != null ? feeSchedule.id : '');

  if (!feeSchedule?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
