import { Instrument } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';

export function instrumentLabel(
  instrument?: Partial<Instrument> | null,
  dictionary?: Dictionary,
) {
  const label = String(instrument?.symbol != null ? instrument.symbol : '');

  if (!instrument?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
