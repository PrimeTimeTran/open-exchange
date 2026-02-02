'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { OrderWithRelationships } from 'src/features/order/orderSchemas';
import { orderFindApiCall } from 'src/features/order/orderApiCalls';
import { OrderActions } from 'src/features/order/components/OrderActions';
import { orderPermissions } from 'src/features/order/orderPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { accountLabel } from 'src/features/account/accountLabel';
import { AccountLink } from 'src/features/account/components/AccountLink';
import { instrumentLabel } from 'src/features/instrument/instrumentLabel';
import { InstrumentLink } from 'src/features/instrument/components/InstrumentLink';
import { tradeLabel } from 'src/features/trade/tradeLabel';
import { TradeLink } from 'src/features/trade/components/TradeLink';
import { orderLabel } from 'src/features/order/orderLabel';

export function OrderView({
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
    queryKey: ['order', id],
    queryFn: async ({ signal }) => {
      return await orderFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'order',
        ]) as Array<OrderWithRelationships>
      )?.find((d) => d.id === id),
  });

  const order = query.data;

  if (query.isSuccess && !order) {
    router.push('/order');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/order');
    return null;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.order.list.menu, '/order'],
            [orderLabel(order, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <OrderActions mode="view" order={order} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {order.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={order.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(order.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.account != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.account}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <AccountLink account={order.account} context={context} />
              <CopyToClipboardButton
                text={accountLabel(order.account, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.instrument != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.instrument}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <InstrumentLink instrument={order.instrument} context={context} />
              <CopyToClipboardButton
                text={instrumentLabel(order.instrument, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.buys?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.order.fields.buys}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {order.buys?.map((item) => {
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
        {order.sells?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.order.fields.sells}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {order.sells?.map((item) => {
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
        {order.side != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.side}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.order.enumerators.side,
                  order.side,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.order.enumerators.side,
                  order.side,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.order.enumerators.type,
                  order.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.order.enumerators.type,
                  order.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.price != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.price}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(order.price?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  order.price?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.quantity != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.quantity}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(order.quantity?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  order.quantity?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.quantityFilled != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.quantityFilled}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(order.quantityFilled?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  order.quantityFilled?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.order.enumerators.status,
                  order.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.order.enumerators.status,
                  order.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {order.timeInFore != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.timeInFore}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.order.enumerators.timeInFore,
                  order.timeInFore,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.order.enumerators.timeInFore,
                  order.timeInFore,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {order.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={order.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  order.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {order.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(order.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(order.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {order.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={order.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  order.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {order.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(order.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(order.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {order.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={order.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  order.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {order.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.order.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(order.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(order.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
