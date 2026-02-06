import { UserNotification } from '@prisma/client';
import { Dictionary } from 'src/translation/locales';


export function userNotificationLabel(userNotification?: Partial<UserNotification> | null, dictionary?: Dictionary) {
  const label = String(userNotification?.id != null ? userNotification.id : '');

  if (!userNotification?.archivedAt) {
    return label;
  }

  return `${label} (${dictionary?.shared.archived})`;
}
