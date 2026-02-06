'use client';

import { Chater } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChaterForm } from 'src/features/chater/components/ChaterForm';
import { chaterFindApiCall } from 'src/features/chater/chaterApiCalls';
import { chaterLabel } from 'src/features/chater/chaterLabel';
import { ChaterWithRelationships } from 'src/features/chater/chaterSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function ChaterEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [chater, setChater] = useState<ChaterWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setChater(undefined);
        const chater = await chaterFindApiCall(id);

        if (!chater) {
          router.push('/chater');
        }

        setChater(chater);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/chater');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!chater) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.chater.list.menu, '/chater'],
          [chaterLabel(chater, context.dictionary), `/chater/${chater?.id}`],
          [dictionary.chater.edit.menu],
        ]}
      />
      <div className="my-10">
        <ChaterForm
          context={context}
          chater={chater}
          onSuccess={(chater: Chater) => router.push(`/chater/${chater.id}`)}
          onCancel={() => router.push('/chater')}
        />
      </div>
    </div>
  );
}
