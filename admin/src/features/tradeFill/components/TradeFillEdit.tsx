'use client';

import { TradeFill } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TradeFillForm } from 'src/features/tradeFill/components/TradeFillForm';
import { tradeFillFindApiCall } from 'src/features/tradeFill/tradeFillApiCalls';
import { tradeFillLabel } from 'src/features/tradeFill/tradeFillLabel';
import { TradeFillWithRelationships } from 'src/features/tradeFill/tradeFillSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function TradeFillEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [tradeFill, setTradeFill] = useState<TradeFillWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setTradeFill(undefined);
        const tradeFill = await tradeFillFindApiCall(id);

        if (!tradeFill) {
          router.push('/trade-fill');
        }

        setTradeFill(tradeFill);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/trade-fill');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!tradeFill) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.tradeFill.list.menu, '/trade-fill'],
          [tradeFillLabel(tradeFill, context.dictionary), `/trade-fill/${tradeFill?.id}`],
          [dictionary.tradeFill.edit.menu],
        ]}
      />
      <div className="my-10">
        <TradeFillForm
          context={context}
          tradeFill={tradeFill}
          onSuccess={(tradeFill: TradeFill) => router.push(`/trade-fill/${tradeFill.id}`)}
          onCancel={() => router.push('/trade-fill')}
        />
      </div>
    </div>
  );
}
