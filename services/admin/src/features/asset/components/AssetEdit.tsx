'use client';

import { Asset } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AssetForm } from 'src/features/asset/components/AssetForm';
import { assetFindApiCall } from 'src/features/asset/assetApiCalls';
import { assetLabel } from 'src/features/asset/assetLabel';
import { AssetWithRelationships } from 'src/features/asset/assetSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function AssetEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [asset, setAsset] = useState<AssetWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setAsset(undefined);
        const asset = await assetFindApiCall(id);

        if (!asset) {
          router.push('/asset');
        }

        setAsset(asset);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/asset');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!asset) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.asset.list.menu, '/asset'],
          [assetLabel(asset, context.dictionary), `/asset/${asset?.id}`],
          [dictionary.asset.edit.menu],
        ]}
      />
      <div className="my-10">
        <AssetForm
          context={context}
          asset={asset}
          onSuccess={(asset: Asset) => router.push(`/asset/${asset.id}`)}
          onCancel={() => router.push('/asset')}
        />
      </div>
    </div>
  );
}
