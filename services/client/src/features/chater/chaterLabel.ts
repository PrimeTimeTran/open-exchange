import { Chater } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function chaterLabel(chater?: Partial<Chater> | null, dictionary?: Dictionary) {
  const label = String(chater?.id != null ? chater.id : '');

  if (!chater?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
