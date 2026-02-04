'use client';

import { Fill } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FillForm } from 'src/features/fill/components/FillForm';
import { fillFindApiCall } from 'src/features/fill/fillApiCalls';
import { fillLabel } from 'src/features/fill/fillLabel';
import { FillWithRelationships } from 'src/features/fill/fillSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function FillEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [fill, setFill] = useState<FillWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setFill(undefined);
        const fill = await fillFindApiCall(id);

        if (!fill) {
          router.push('/fill');
        }

        setFill(fill);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/fill');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!fill) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.fill.list.menu, '/fill'],
          [fillLabel(fill, context.dictionary), `/fill/${fill?.id}`],
          [dictionary.fill.edit.menu],
        ]}
      />
      <div className="my-10">
        <FillForm
          context={context}
          fill={fill}
          onSuccess={(fill: Fill) => router.push(`/fill/${fill.id}`)}
          onCancel={() => router.push('/fill')}
        />
      </div>
    </div>
  );
}
