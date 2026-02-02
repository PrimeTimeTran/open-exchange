'use client';

import { Message } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { MessageForm } from 'src/features/message/components/MessageForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function MessageNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <MessageForm
      context={context}
      onSuccess={(message: Message) =>
        router.push(`/message/${message.id}`)
      }
      onCancel={() => router.push('/message')}
    />
  );
}
