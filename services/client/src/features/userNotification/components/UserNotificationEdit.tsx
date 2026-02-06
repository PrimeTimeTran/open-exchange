'use client';

import { UserNotification } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserNotificationForm } from 'src/features/userNotification/components/UserNotificationForm';
import { userNotificationFindApiCall } from 'src/features/userNotification/userNotificationApiCalls';
import { userNotificationLabel } from 'src/features/userNotification/userNotificationLabel';
import { UserNotificationWithRelationships } from 'src/features/userNotification/userNotificationSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function UserNotificationEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [userNotification, setUserNotification] = useState<UserNotificationWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setUserNotification(undefined);
        const userNotification = await userNotificationFindApiCall(id);

        if (!userNotification) {
          router.push('/user-notification');
        }

        setUserNotification(userNotification);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/user-notification');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!userNotification) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.userNotification.list.menu, '/user-notification'],
          [userNotificationLabel(userNotification, context.dictionary), `/user-notification/${userNotification?.id}`],
          [dictionary.userNotification.edit.menu],
        ]}
      />
      <div className="my-10">
        <UserNotificationForm
          context={context}
          userNotification={userNotification}
          onSuccess={(userNotification: UserNotification) => router.push(`/user-notification/${userNotification.id}`)}
          onCancel={() => router.push('/user-notification')}
        />
      </div>
    </div>
  );
}
