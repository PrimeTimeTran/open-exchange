'use client';

import { Item } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ItemForm } from 'src/features/item/components/ItemForm';
import { itemFindApiCall } from 'src/features/item/itemApiCalls';
import { itemLabel } from 'src/features/item/itemLabel';
import { ItemWithRelationships } from 'src/features/item/itemSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function ItemEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [item, setItem] = useState<ItemWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setItem(undefined);
        const item = await itemFindApiCall(id);

        if (!item) {
          router.push('/item');
        }

        setItem(item);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/item');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!item) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.item.list.menu, '/item'],
          [itemLabel(item, context.dictionary), `/item/${item?.id}`],
          [dictionary.item.edit.menu],
        ]}
      />
      <div className="my-10">
        <ItemForm
          context={context}
          item={item}
          onSuccess={(item: Item) => router.push(`/item/${item.id}`)}
          onCancel={() => router.push('/item')}
        />
      </div>
    </div>
  );
}
