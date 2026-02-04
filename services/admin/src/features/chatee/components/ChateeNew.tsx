'use client';

import { Chatee } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ChateeForm } from 'src/features/chatee/components/ChateeForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ChateeNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <ChateeForm
      context={context}
      onSuccess={(chatee: Chatee) =>
        router.push(`/chatee/${chatee.id}`)
      }
      onCancel={() => router.push('/chatee')}
    />
  );
}
