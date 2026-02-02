'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { TradeWithRelationships } from 'src/features/trade/tradeSchemas';
import { tradeFindApiCall } from 'src/features/trade/tradeApiCalls';
import { TradeActions } from 'src/features/trade/components/TradeActions';
import { tradePermissions } from 'src/features/trade/tradePermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { orderLabel } from 'src/features/order/orderLabel';
import { OrderLink } from 'src/features/order/components/OrderLink';
import { instrumentLabel } from 'src/features/instrument/instrumentLabel';
import { InstrumentLink } from 'src/features/instrument/components/InstrumentLink';
import { tradeFillLabel } from 'src/features/tradeFill/tradeFillLabel';
import { TradeFillLink } from 'src/features/tradeFill/components/TradeFillLink';
import { tradeLabel } from 'src/features/trade/tradeLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function TradeView({
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
    queryKey: ['trade', id],
    queryFn: async ({ signal }) => {
      return await tradeFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'trade',
        ]) as Array<TradeWithRelationships>
      )?.find((d) => d.id === id),
  });

  const trade = query.data;

  if (query.isSuccess && !trade) {
    router.push('/trade');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/trade');
    return null;
  }

  if (!trade) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.trade.list.menu, '/trade'],
            [tradeLabel(trade, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <TradeActions mode="view" trade={trade} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {trade.price != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.price}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(trade.price?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  trade.price?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {trade.quantity != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.quantity}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(trade.quantity?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  trade.quantity?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {trade.buyOrderId?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.trade.fields.buyOrderId}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {trade.buyOrderId?.map((item) => {
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
        {trade.sellOrderId?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.trade.fields.sellOrderId}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {trade.sellOrderId?.map((item) => {
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
        {trade.instrument != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.instrument}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <InstrumentLink instrument={trade.instrument} context={context} />
              <CopyToClipboardButton
                text={instrumentLabel(trade.instrument, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {trade.tradeFills?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.trade.fields.tradeFills}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {trade.tradeFills?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <TradeFillLink
                    tradeFill={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={tradeFillLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {trade.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={trade.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  trade.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {trade.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(trade.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(trade.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {trade.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={trade.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  trade.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {trade.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(trade.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(trade.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {trade.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={trade.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  trade.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {trade.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.trade.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(trade.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(trade.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
