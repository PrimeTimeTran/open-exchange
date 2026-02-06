'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { NotificationWithRelationships } from 'src/features/notification/notificationSchemas';
import { notificationFindApiCall } from 'src/features/notification/notificationApiCalls';
import { NotificationActions } from 'src/features/notification/components/NotificationActions';
import { notificationPermissions } from 'src/features/notification/notificationPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { userNotificationLabel } from 'src/features/userNotification/userNotificationLabel';
import { UserNotificationLink } from 'src/features/userNotification/components/UserNotificationLink';
import { notificationLabel } from 'src/features/notification/notificationLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function NotificationView({
  id,
  context,
}: {
  id: string;
  context: AppContext;
}) {
  const { dictionary } = context;
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['notification', id],
    queryFn: async ({ signal }) => {
      return await notificationFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'notification',
        ]) as Array<NotificationWithRelationships>
      )?.find((d) => d.id === id),
  });

  const notification = query.data;

  if (query.isSuccess && !notification) {
    router.push('/notification');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/notification');
    return null;
  }

  if (!notification) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.notification.list.menu, '/notification'],
            [notificationLabel(notification, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <NotificationActions mode="view" notification={notification} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {notification.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.notification.enumerators.type,
                  notification.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.notification.enumerators.type,
                  notification.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {notification.severity != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.severity}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.notification.enumerators.severity,
                  notification.severity,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.notification.enumerators.severity,
                  notification.severity,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(notification.title) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.title}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{notification.title}</span>
              <CopyToClipboardButton
                text={notification.title}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(notification.body) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.body}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{notification.body}</span>
              <CopyToClipboardButton
                text={notification.body}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(notification.actionUrl) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.actionUrl}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{notification.actionUrl}</span>
              <CopyToClipboardButton
                text={notification.actionUrl}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {notification.scope != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.scope}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.notification.enumerators.scope,
                  notification.scope,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.notification.enumerators.scope,
                  notification.scope,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(notification.targetUserId) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.targetUserId}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{notification.targetUserId}</span>
              <CopyToClipboardButton
                text={notification.targetUserId}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(notification.targetSegment) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.targetSegment}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{notification.targetSegment}</span>
              <CopyToClipboardButton
                text={notification.targetSegment}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {notification.persistent != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.persistent}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {notification.persistent
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  notification.persistent
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {notification.dismissible != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.dismissible}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {notification.dismissible
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  notification.dismissible
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {notification.requiresAck != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.requiresAck}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {notification.requiresAck
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  notification.requiresAck
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {notification.userNotifications?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.notification.fields.userNotifications}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {notification.userNotifications?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <UserNotificationLink
                    userNotification={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={userNotificationLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {notification.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={notification.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  notification.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {notification.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(notification.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(notification.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {notification.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={notification.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  notification.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {notification.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(notification.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(notification.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {notification.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={notification.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  notification.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {notification.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.notification.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(notification.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(notification.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
