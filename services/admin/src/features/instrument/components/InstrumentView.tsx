'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { InstrumentWithRelationships } from 'src/features/instrument/instrumentSchemas';
import { instrumentFindApiCall } from 'src/features/instrument/instrumentApiCalls';
import { InstrumentActions } from 'src/features/instrument/components/InstrumentActions';
import { instrumentPermissions } from 'src/features/instrument/instrumentPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { assetLabel } from 'src/features/asset/assetLabel';
import { AssetLink } from 'src/features/asset/components/AssetLink';
import { orderLabel } from 'src/features/order/orderLabel';
import { OrderLink } from 'src/features/order/components/OrderLink';
import { tradeLabel } from 'src/features/trade/tradeLabel';
import { TradeLink } from 'src/features/trade/components/TradeLink';
import { instrumentLabel } from 'src/features/instrument/instrumentLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function InstrumentView({
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
    queryKey: ['instrument', id],
    queryFn: async ({ signal }) => {
      return await instrumentFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'instrument',
        ]) as Array<InstrumentWithRelationships>
      )?.find((d) => d.id === id),
  });

  const instrument = query.data;

  if (query.isSuccess && !instrument) {
    router.push('/instrument');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/instrument');
    return null;
  }

  if (!instrument) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.instrument.list.menu, '/instrument'],
            [instrumentLabel(instrument, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <InstrumentActions mode="view" instrument={instrument} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(instrument.symbol) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.symbol}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{instrument.symbol}</span>
              <CopyToClipboardButton
                text={instrument.symbol}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {instrument.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.instrument.enumerators.type,
                  instrument.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.instrument.enumerators.type,
                  instrument.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {instrument.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.instrument.enumerators.status,
                  instrument.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.instrument.enumerators.status,
                  instrument.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {instrument.underlyingAsset != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.underlyingAsset}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AssetLink asset={instrument.underlyingAsset} context={context} />
              <CopyToClipboardButton
                text={assetLabel(instrument.underlyingAsset, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {instrument.quoteAsset != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.quoteAsset}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AssetLink asset={instrument.quoteAsset} context={context} />
              <CopyToClipboardButton
                text={assetLabel(instrument.quoteAsset, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {instrument.orders?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.instrument.fields.orders}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {instrument.orders?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <OrderLink
                    order={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={orderLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {instrument.trades?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.instrument.fields.trades}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {instrument.trades?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <TradeLink
                    trade={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={tradeLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {instrument.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={instrument.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  instrument.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {instrument.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(instrument.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(instrument.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {instrument.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={instrument.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  instrument.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {instrument.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(instrument.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(instrument.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {instrument.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={instrument.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  instrument.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {instrument.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.instrument.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(instrument.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(instrument.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
