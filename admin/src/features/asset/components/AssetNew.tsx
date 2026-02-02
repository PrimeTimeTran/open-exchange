'use client';

import { Asset } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { AssetForm } from 'src/features/asset/components/AssetForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function AssetNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <AssetForm
      context={context}
      onSuccess={(asset: Asset) =>
        router.push(`/asset/${asset.id}`)
      }
      onCancel={() => router.push('/asset')}
    />
  );
}
