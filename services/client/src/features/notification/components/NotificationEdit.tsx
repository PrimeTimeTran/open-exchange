'use client';

import { Notification } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NotificationForm } from 'src/features/notification/components/NotificationForm';
import { notificationFindApiCall } from 'src/features/notification/notificationApiCalls';
import { notificationLabel } from 'src/features/notification/notificationLabel';
import { NotificationWithRelationships } from 'src/features/notification/notificationSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function NotificationEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setNotification(undefined);
        const notification = await notificationFindApiCall(id);

        if (!notification) {
          router.push('/notification');
        }

        setNotification(notification);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/notification');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!notification) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.notification.list.menu, '/notification'],
          [notificationLabel(notification, context.dictionary), `/notification/${notification?.id}`],
          [dictionary.notification.edit.menu],
        ]}
      />
      <div className="my-10">
        <NotificationForm
          context={context}
          notification={notification}
          onSuccess={(notification: Notification) => router.push(`/notification/${notification.id}`)}
          onCancel={() => router.push('/notification')}
        />
      </div>
    </div>
  );
}
