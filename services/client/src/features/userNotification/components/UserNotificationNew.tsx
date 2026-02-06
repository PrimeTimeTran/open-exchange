'use client';

import { UserNotification } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { UserNotificationForm } from 'src/features/userNotification/components/UserNotificationForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function UserNotificationNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <UserNotificationForm
      context={context}
      onSuccess={(userNotification: UserNotification) =>
        router.push(`/user-notification/${userNotification.id}`)
      }
      onCancel={() => router.push('/user-notification')}
    />
  );
}
