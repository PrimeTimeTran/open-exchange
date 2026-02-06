'use client';

import { Chat } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatForm } from 'src/features/chat/components/ChatForm';
import { chatFindApiCall } from 'src/features/chat/chatApiCalls';
import { chatLabel } from 'src/features/chat/chatLabel';
import { ChatWithRelationships } from 'src/features/chat/chatSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function ChatEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [chat, setChat] = useState<ChatWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setChat(undefined);
        const chat = await chatFindApiCall(id);

        if (!chat) {
          router.push('/chat');
        }

        setChat(chat);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/chat');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!chat) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.chat.list.menu, '/chat'],
          [chatLabel(chat, context.dictionary), `/chat/${chat?.id}`],
          [dictionary.chat.edit.menu],
        ]}
      />
      <div className="my-10">
        <ChatForm
          context={context}
          chat={chat}
          onSuccess={(chat: Chat) => router.push(`/chat/${chat.id}`)}
          onCancel={() => router.push('/chat')}
        />
      </div>
    </div>
  );
}
