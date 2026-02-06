'use client';

import { Notification } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { NotificationForm } from 'src/features/notification/components/NotificationForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function NotificationNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <NotificationForm
      context={context}
      onSuccess={(notification: Notification) =>
        router.push(`/notification/${notification.id}`)
      }
      onCancel={() => router.push('/notification')}
    />
  );
}
