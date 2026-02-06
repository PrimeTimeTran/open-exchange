import { Fill } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function fillLabel(fill?: Partial<Fill> | null, dictionary?: Dictionary) {
  const label = String(fill?.id != null ? fill.id : '');

  if (!fill?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
