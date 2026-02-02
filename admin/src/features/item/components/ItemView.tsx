'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ItemWithRelationships } from 'src/features/item/itemSchemas';
import { itemFindApiCall } from 'src/features/item/itemApiCalls';
import { ItemActions } from 'src/features/item/components/ItemActions';
import { itemPermissions } from 'src/features/item/itemPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import FileListItem from 'src/features/file/components/FileListItem';
import { itemLabel } from 'src/features/item/itemLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function ItemView({
  id,
  context,
}: {
  id: string;
  context: AppContext;
}) {
  const { dictionary } = context;
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['item', id],
    queryFn: async ({ signal }) => {
      return await itemFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'item',
        ]) as Array<ItemWithRelationships>
      )?.find((d) => d.id === id),
  });

  const item = query.data;

  if (query.isSuccess && !item) {
    router.push('/item');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/item');
    return null;
  }

  if (!item) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.item.list.menu, '/item'],
            [itemLabel(item, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <ItemActions mode="view" item={item} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(item.name) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.name}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{item.name}</span>
              <CopyToClipboardButton
                text={item.name}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(item.caption) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.caption}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{item.caption}</span>
              <CopyToClipboardButton
                text={item.caption}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(item.description) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.description}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{item.description}</span>
              <CopyToClipboardButton
                text={item.description}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {item.price != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.price}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(item.price?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  item.price?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean((item.photos as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.photos}
            </div>
            <div className="col-span-2">
              <ImagesInput
                readonly
                value={item.photos as any}
                dictionary={dictionary}
              />
            </div>
          </div>
        )}
        {item.category?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">{dictionary.item.fields.category}</div>
          <div className="col-span-2 flex flex-col gap-1">
            {item.category.map((value, index) => {
              return (
                <div key={index} className="flex items-center gap-4">
                  <span>{value}</span>
                  <CopyToClipboardButton
                    text={value}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {Boolean((item.files as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.files}
            </div>
            <div className="col-span-2">
              <FileListItem files={item.files as Array<any>} />
            </div>
          </div>
        )}

        {item.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={item.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  item.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {item.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(item.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(item.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {item.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={item.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  item.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {item.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(item.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(item.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {item.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={item.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  item.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {item.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.item.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(item.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(item.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
