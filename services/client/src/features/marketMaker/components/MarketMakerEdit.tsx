'use client';

import { MarketMaker } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MarketMakerForm } from 'src/features/marketMaker/components/MarketMakerForm';
import { marketMakerFindApiCall } from 'src/features/marketMaker/marketMakerApiCalls';
import { marketMakerLabel } from 'src/features/marketMaker/marketMakerLabel';
import { MarketMakerWithRelationships } from 'src/features/marketMaker/marketMakerSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function MarketMakerEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [marketMaker, setMarketMaker] = useState<MarketMakerWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setMarketMaker(undefined);
        const marketMaker = await marketMakerFindApiCall(id);

        if (!marketMaker) {
          router.push('/market-maker');
        }

        setMarketMaker(marketMaker);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/market-maker');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!marketMaker) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.marketMaker.list.menu, '/market-maker'],
          [marketMakerLabel(marketMaker, context.dictionary), `/market-maker/${marketMaker?.id}`],
          [dictionary.marketMaker.edit.menu],
        ]}
      />
      <div className="my-10">
        <MarketMakerForm
          context={context}
          marketMaker={marketMaker}
          onSuccess={(marketMaker: MarketMaker) => router.push(`/market-maker/${marketMaker.id}`)}
          onCancel={() => router.push('/market-maker')}
        />
      </div>
    </div>
  );
}
