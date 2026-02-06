import { Chatee } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function chateeLabel(chatee?: Partial<Chatee> | null, dictionary?: Dictionary) {
  const label = String(chatee?.id != null ? chatee.id : '');

  if (!chatee?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
