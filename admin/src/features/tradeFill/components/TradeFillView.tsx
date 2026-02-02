'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { TradeFillWithRelationships } from 'src/features/tradeFill/tradeFillSchemas';
import { tradeFillFindApiCall } from 'src/features/tradeFill/tradeFillApiCalls';
import { TradeFillActions } from 'src/features/tradeFill/components/TradeFillActions';
import { tradeFillPermissions } from 'src/features/tradeFill/tradeFillPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { tradeLabel } from 'src/features/trade/tradeLabel';
import { TradeLink } from 'src/features/trade/components/TradeLink';
import { tradeFillLabel } from 'src/features/tradeFill/tradeFillLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function TradeFillView({
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
    queryKey: ['tradeFill', id],
    queryFn: async ({ signal }) => {
      return await tradeFillFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'tradeFill',
        ]) as Array<TradeFillWithRelationships>
      )?.find((d) => d.id === id),
  });

  const tradeFill = query.data;

  if (query.isSuccess && !tradeFill) {
    router.push('/trade-fill');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/trade-fill');
    return null;
  }

  if (!tradeFill) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.tradeFill.list.menu, '/trade-fill'],
            [tradeFillLabel(tradeFill, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <TradeFillActions mode="view" tradeFill={tradeFill} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {tradeFill.side != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.side}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.tradeFill.enumerators.side,
                  tradeFill.side,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.tradeFill.enumerators.side,
                  tradeFill.side,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {tradeFill.price != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.price}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(tradeFill.price?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  tradeFill.price?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {tradeFill.quantity != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.quantity}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(tradeFill.quantity?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  tradeFill.quantity?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {tradeFill.fee != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.fee}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(tradeFill.fee?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  tradeFill.fee?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {tradeFill.trade != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.trade}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <TradeLink trade={tradeFill.trade} context={context} />
              <CopyToClipboardButton
                text={tradeLabel(tradeFill.trade, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {tradeFill.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={tradeFill.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  tradeFill.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {tradeFill.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(tradeFill.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(tradeFill.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {tradeFill.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={tradeFill.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  tradeFill.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {tradeFill.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(tradeFill.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(tradeFill.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {tradeFill.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={tradeFill.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  tradeFill.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {tradeFill.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.tradeFill.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(tradeFill.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(tradeFill.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
