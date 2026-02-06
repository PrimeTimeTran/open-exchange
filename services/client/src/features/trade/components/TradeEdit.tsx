'use client';

import { Trade } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TradeForm } from 'src/features/trade/components/TradeForm';
import { tradeFindApiCall } from 'src/features/trade/tradeApiCalls';
import { tradeLabel } from 'src/features/trade/tradeLabel';
import { TradeWithRelationships } from 'src/features/trade/tradeSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function TradeEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [trade, setTrade] = useState<TradeWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setTrade(undefined);
        const trade = await tradeFindApiCall(id);

        if (!trade) {
          router.push('/trade');
        }

        setTrade(trade);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/trade');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!trade) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.trade.list.menu, '/trade'],
          [tradeLabel(trade, context.dictionary), `/trade/${trade?.id}`],
          [dictionary.trade.edit.menu],
        ]}
      />
      <div className="my-10">
        <TradeForm
          context={context}
          trade={trade}
          onSuccess={(trade: Trade) => router.push(`/trade/${trade.id}`)}
          onCancel={() => router.push('/trade')}
        />
      </div>
    </div>
  );
}
