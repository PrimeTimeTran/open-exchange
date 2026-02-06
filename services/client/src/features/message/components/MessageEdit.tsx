'use client';

import { Message } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageForm } from 'src/features/message/components/MessageForm';
import { messageFindApiCall } from 'src/features/message/messageApiCalls';
import { messageLabel } from 'src/features/message/messageLabel';
import { MessageWithRelationships } from 'src/features/message/messageSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function MessageEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [message, setMessage] = useState<MessageWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setMessage(undefined);
        const message = await messageFindApiCall(id);

        if (!message) {
          router.push('/message');
        }

        setMessage(message);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/message');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!message) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.message.list.menu, '/message'],
          [messageLabel(message, context.dictionary), `/message/${message?.id}`],
          [dictionary.message.edit.menu],
        ]}
      />
      <div className="my-10">
        <MessageForm
          context={context}
          message={message}
          onSuccess={(message: Message) => router.push(`/message/${message.id}`)}
          onCancel={() => router.push('/message')}
        />
      </div>
    </div>
  );
}
