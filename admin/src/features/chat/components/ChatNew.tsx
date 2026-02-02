'use client';

import { Chat } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ChatForm } from 'src/features/chat/components/ChatForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ChatNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <ChatForm
      context={context}
      onSuccess={(chat: Chat) =>
        router.push(`/chat/${chat.id}`)
      }
      onCancel={() => router.push('/chat')}
    />
  );
}
