import { Chat } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function chatLabel(chat?: Partial<Chat> | null, dictionary?: Dictionary) {
  const label = String(chat?.id != null ? chat.id : '');

  if (!chat?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
