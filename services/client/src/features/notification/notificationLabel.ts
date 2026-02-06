import { Notification } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function notificationLabel(notification?: Partial<Notification> | null, dictionary?: Dictionary) {
  const label = String(notification?.id != null ? notification.id : '');

  if (!notification?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
