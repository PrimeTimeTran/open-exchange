import { Item } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function itemLabel(item?: Partial<Item> | null, dictionary?: Dictionary) {
  const label = String(item?.id != null ? item.id : '');

  if (!item?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
