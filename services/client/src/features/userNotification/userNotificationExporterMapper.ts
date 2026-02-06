import { UserNotificationWithRelationships } from 'src/features/userNotification/userNotificationSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function userNotificationExporterMapper(
  userNotifications: UserNotificationWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return userNotifications.map((userNotification) => {
    return {
      id: userNotification.id,
      readAt: userNotification.readAt ? String(userNotification.readAt) : undefined,
      dismissedAt: userNotification.dismissedAt ? String(userNotification.dismissedAt) : undefined,
      acknowledgedAt: userNotification.acknowledgedAt ? String(userNotification.acknowledgedAt) : undefined,
      deliveryChannel: enumeratorLabel(
        context.dictionary.userNotification.enumerators.deliveryChannel,
        userNotification.deliveryChannel,
      ),
      deliveredAt: userNotification.deliveredAt ? String(userNotification.deliveredAt) : undefined,
      meta: userNotification.meta?.toString(),
      createdByMembership: membershipLabel(userNotification.createdByMembership, context.dictionary),
      createdAt: String(userNotification.createdAt),
      updatedByMembership: membershipLabel(userNotification.createdByMembership, context.dictionary),
      updatedAt: String(userNotification.updatedAt),
      archivedByMembership: membershipLabel(
        userNotification.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(userNotification.archivedAt),
    };
  });
}
