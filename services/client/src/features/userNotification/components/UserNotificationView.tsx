'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { UserNotificationWithRelationships } from 'src/features/userNotification/userNotificationSchemas';
import { userNotificationFindApiCall } from 'src/features/userNotification/userNotificationApiCalls';
import { UserNotificationActions } from 'src/features/userNotification/components/UserNotificationActions';
import { userNotificationPermissions } from 'src/features/userNotification/userNotificationPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { notificationLabel } from 'src/features/notification/notificationLabel';
import { NotificationLink } from 'src/features/notification/components/NotificationLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { userNotificationLabel } from 'src/features/userNotification/userNotificationLabel';

export function UserNotificationView({
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
    queryKey: ['userNotification', id],
    queryFn: async ({ signal }) => {
      return await userNotificationFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'userNotification',
        ]) as Array<UserNotificationWithRelationships>
      )?.find((d) => d.id === id),
  });

  const userNotification = query.data;

  if (query.isSuccess && !userNotification) {
    router.push('/user-notification');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/user-notification');
    return null;
  }

  if (!userNotification) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.userNotification.list.menu, '/user-notification'],
            [userNotificationLabel(userNotification, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <UserNotificationActions mode="view" userNotification={userNotification} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {userNotification.readAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.readAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(userNotification.readAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(userNotification.readAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {userNotification.dismissedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.dismissedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(userNotification.dismissedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(userNotification.dismissedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {userNotification.acknowledgedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.acknowledgedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(userNotification.acknowledgedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(userNotification.acknowledgedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {userNotification.deliveryChannel != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.deliveryChannel}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.userNotification.enumerators.deliveryChannel,
                  userNotification.deliveryChannel,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.userNotification.enumerators.deliveryChannel,
                  userNotification.deliveryChannel,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {userNotification.deliveredAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.deliveredAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(userNotification.deliveredAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(userNotification.deliveredAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {userNotification.notification != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.notification}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <NotificationLink notification={userNotification.notification} context={context} />
              <CopyToClipboardButton
                text={notificationLabel(userNotification.notification, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {userNotification.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={userNotification.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(userNotification.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {userNotification.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={userNotification.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  userNotification.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {userNotification.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(userNotification.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(userNotification.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {userNotification.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={userNotification.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  userNotification.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {userNotification.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(userNotification.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(userNotification.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {userNotification.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={userNotification.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  userNotification.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {userNotification.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.userNotification.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(userNotification.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(userNotification.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
