import { Instrument } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function instrumentLabel(instrument?: Partial<Instrument> | null, dictionary?: Dictionary) {
  const label = String(instrument?.id != null ? instrument.id : '');

  if (!instrument?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
