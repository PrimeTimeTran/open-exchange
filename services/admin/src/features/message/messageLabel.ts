import { Message } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function messageLabel(message?: Partial<Message> | null, dictionary?: Dictionary) {
  const label = String(message?.id != null ? message.id : '');

  if (!message?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
