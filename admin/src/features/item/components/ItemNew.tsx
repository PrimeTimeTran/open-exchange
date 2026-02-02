'use client';

import { Item } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ItemForm } from 'src/features/item/components/ItemForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ItemNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <ItemForm
      context={context}
      onSuccess={(item: Item) =>
        router.push(`/item/${item.id}`)
      }
      onCancel={() => router.push('/item')}
    />
  );
}
