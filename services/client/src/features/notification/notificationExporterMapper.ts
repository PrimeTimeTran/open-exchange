import { NotificationWithRelationships } from 'src/features/notification/notificationSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function notificationExporterMapper(
  notifications: NotificationWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return notifications.map((notification) => {
    return {
      id: notification.id,
      type: enumeratorLabel(
        context.dictionary.notification.enumerators.type,
        notification.type,
      ),
      severity: enumeratorLabel(
        context.dictionary.notification.enumerators.severity,
        notification.severity,
      ),
      title: notification.title,
      body: notification.body,
      actionUrl: notification.actionUrl,
      scope: enumeratorLabel(
        context.dictionary.notification.enumerators.scope,
        notification.scope,
      ),
      targetUserId: notification.targetUserId,
      targetSegment: notification.targetSegment,
      persistent: notification.persistent
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      dismissible: notification.dismissible
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      requiresAck: notification.requiresAck
        ? context.dictionary.shared.yes
        : context.dictionary.shared.no,
      meta: notification.meta?.toString(),
      createdByMembership: membershipLabel(notification.createdByMembership, context.dictionary),
      createdAt: String(notification.createdAt),
      updatedByMembership: membershipLabel(notification.createdByMembership, context.dictionary),
      updatedAt: String(notification.updatedAt),
      archivedByMembership: membershipLabel(
        notification.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(notification.archivedAt),
    };
  });
}
