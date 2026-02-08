'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MarketMakerWithRelationships } from 'src/features/marketMaker/marketMakerSchemas';
import { marketMakerFindApiCall } from 'src/features/marketMaker/marketMakerApiCalls';
import { MarketMakerActions } from 'src/features/marketMaker/components/MarketMakerActions';
import { marketMakerPermissions } from 'src/features/marketMaker/marketMakerPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { marketMakerLabel } from 'src/features/marketMaker/marketMakerLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function MarketMakerView({
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
    queryKey: ['marketMaker', id],
    queryFn: async ({ signal }) => {
      return await marketMakerFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'marketMaker',
        ]) as Array<MarketMakerWithRelationships>
      )?.find((d) => d.id === id),
  });

  const marketMaker = query.data;

  if (query.isSuccess && !marketMaker) {
    router.push('/market-maker');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/market-maker');
    return null;
  }

  if (!marketMaker) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.marketMaker.list.menu, '/market-maker'],
            [marketMakerLabel(marketMaker, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <MarketMakerActions mode="view" marketMaker={marketMaker} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(marketMaker.organizationName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.organizationName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.organizationName}</span>
              <CopyToClipboardButton
                text={marketMaker.organizationName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(marketMaker.contactEmail) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.contactEmail}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.contactEmail}</span>
              <CopyToClipboardButton
                text={marketMaker.contactEmail}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(marketMaker.contactPhone) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.contactPhone}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.contactPhone}</span>
              <CopyToClipboardButton
                text={marketMaker.contactPhone}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.marketMaker.enumerators.status,
                  marketMaker.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.marketMaker.enumerators.status,
                  marketMaker.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.tier != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.tier}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.marketMaker.enumerators.tier,
                  marketMaker.tier,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.marketMaker.enumerators.tier,
                  marketMaker.tier,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(marketMaker.marketsSupported) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.marketsSupported}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.marketsSupported}</span>
              <CopyToClipboardButton
                text={marketMaker.marketsSupported}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.minQuoteSize != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.minQuoteSize}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.minQuoteSize}</span>
              <CopyToClipboardButton
                text={marketMaker.minQuoteSize.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.maxQuoteSize != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.maxQuoteSize}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.maxQuoteSize}</span>
              <CopyToClipboardButton
                text={marketMaker.maxQuoteSize.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.spreadLimit != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.spreadLimit}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.spreadLimit}</span>
              <CopyToClipboardButton
                text={marketMaker.spreadLimit.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.quoteObligation != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.quoteObligation}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {marketMaker.quoteObligation
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  marketMaker.quoteObligation
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.dailyVolumeTarget != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.dailyVolumeTarget}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.dailyVolumeTarget}</span>
              <CopyToClipboardButton
                text={marketMaker.dailyVolumeTarget.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.makerFee != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.makerFee}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.makerFee}</span>
              <CopyToClipboardButton
                text={marketMaker.makerFee.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.takerFee != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.takerFee}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.takerFee}</span>
              <CopyToClipboardButton
                text={marketMaker.takerFee.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.rebateRate != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.rebateRate}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.rebateRate}</span>
              <CopyToClipboardButton
                text={marketMaker.rebateRate.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.rebateBalance != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.rebateBalance}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.rebateBalance}</span>
              <CopyToClipboardButton
                text={marketMaker.rebateBalance.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.apiAccess != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.apiAccess}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {marketMaker.apiAccess
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  marketMaker.apiAccess
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.maxOrdersPerSecond != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.maxOrdersPerSecond}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.maxOrdersPerSecond}</span>
              <CopyToClipboardButton
                text={marketMaker.maxOrdersPerSecond.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.directMarketAccess != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.directMarketAccess}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {marketMaker.directMarketAccess
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  marketMaker.directMarketAccess
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.contractSignedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.contractSignedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDatetime(marketMaker.contractSignedAt, dictionary)}
              </span>
              <CopyToClipboardButton
                text={formatDatetime(marketMaker.contractSignedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.obligationViolationCount != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.obligationViolationCount}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.obligationViolationCount}</span>
              <CopyToClipboardButton
                text={marketMaker.obligationViolationCount.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(marketMaker.notesInternal) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.notesInternal}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{marketMaker.notesInternal}</span>
              <CopyToClipboardButton
                text={marketMaker.notesInternal}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.specialOrderTypes != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.specialOrderTypes}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.marketMaker.enumerators.specialOrderTypes,
                  marketMaker.specialOrderTypes,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.marketMaker.enumerators.specialOrderTypes,
                  marketMaker.specialOrderTypes,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {marketMaker.minFeeAmount != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.minFeeAmount}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {formatDecimal(marketMaker.minFeeAmount?.toString(), context.locale)}
              </span>
              <CopyToClipboardButton
                text={formatDecimal(
                  marketMaker.minFeeAmount?.toString(),
                  context.locale
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {marketMaker.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={marketMaker.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  marketMaker.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {marketMaker.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(marketMaker.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(marketMaker.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {marketMaker.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={marketMaker.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  marketMaker.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {marketMaker.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(marketMaker.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(marketMaker.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {marketMaker.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={marketMaker.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  marketMaker.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {marketMaker.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.marketMaker.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(marketMaker.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(marketMaker.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
