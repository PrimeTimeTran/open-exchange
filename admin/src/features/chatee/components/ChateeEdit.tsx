'use client';

import { Chatee } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChateeForm } from 'src/features/chatee/components/ChateeForm';
import { chateeFindApiCall } from 'src/features/chatee/chateeApiCalls';
import { chateeLabel } from 'src/features/chatee/chateeLabel';
import { ChateeWithRelationships } from 'src/features/chatee/chateeSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function ChateeEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [chatee, setChatee] = useState<ChateeWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setChatee(undefined);
        const chatee = await chateeFindApiCall(id);

        if (!chatee) {
          router.push('/chatee');
        }

        setChatee(chatee);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/chatee');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!chatee) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.chatee.list.menu, '/chatee'],
          [chateeLabel(chatee, context.dictionary), `/chatee/${chatee?.id}`],
          [dictionary.chatee.edit.menu],
        ]}
      />
      <div className="my-10">
        <ChateeForm
          context={context}
          chatee={chatee}
          onSuccess={(chatee: Chatee) => router.push(`/chatee/${chatee.id}`)}
          onCancel={() => router.push('/chatee')}
        />
      </div>
    </div>
  );
}
