'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AssetWithRelationships } from 'src/features/asset/assetSchemas';
import { assetFindApiCall } from 'src/features/asset/assetApiCalls';
import { AssetActions } from 'src/features/asset/components/AssetActions';
import { assetPermissions } from 'src/features/asset/assetPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { instrumentLabel } from 'src/features/instrument/instrumentLabel';
import { InstrumentLink } from 'src/features/instrument/components/InstrumentLink';
import { walletLabel } from 'src/features/wallet/walletLabel';
import { WalletLink } from 'src/features/wallet/components/WalletLink';
import { depositLabel } from 'src/features/deposit/depositLabel';
import { DepositLink } from 'src/features/deposit/components/DepositLink';
import { withdrawalLabel } from 'src/features/withdrawal/withdrawalLabel';
import { WithdrawalLink } from 'src/features/withdrawal/components/WithdrawalLink';
import { balanceSnapshotLabel } from 'src/features/balanceSnapshot/balanceSnapshotLabel';
import { BalanceSnapshotLink } from 'src/features/balanceSnapshot/components/BalanceSnapshotLink';
import { assetLabel } from 'src/features/asset/assetLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function AssetView({
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
    queryKey: ['asset', id],
    queryFn: async ({ signal }) => {
      return await assetFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'asset',
        ]) as Array<AssetWithRelationships>
      )?.find((d) => d.id === id),
  });

  const asset = query.data;

  if (query.isSuccess && !asset) {
    router.push('/asset');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/asset');
    return null;
  }

  if (!asset) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.asset.list.menu, '/asset'],
            [assetLabel(asset, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <AssetActions mode="view" asset={asset} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(asset.symbol) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.symbol}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{asset.symbol}</span>
              <CopyToClipboardButton
                text={asset.symbol}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {asset.klass != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.klass}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.asset.enumerators.klass,
                  asset.klass,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.asset.enumerators.klass,
                  asset.klass,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {asset.precision != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.precision}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{asset.precision}</span>
              <CopyToClipboardButton
                text={asset.precision.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {asset.isFractional != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.isFractional}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {asset.isFractional
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  asset.isFractional
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {asset.decimals != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.decimals}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{asset.decimals}</span>
              <CopyToClipboardButton
                text={asset.decimals.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {asset.baseInstruments?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.asset.fields.baseInstruments}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {asset.baseInstruments?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <InstrumentLink
                    instrument={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={instrumentLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {asset.quoteInstruments?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.asset.fields.quoteInstruments}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {asset.quoteInstruments?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <InstrumentLink
                    instrument={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={instrumentLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {asset.wallets?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.asset.fields.wallets}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {asset.wallets?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <WalletLink
                    wallet={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={walletLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {asset.deposits?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.asset.fields.deposits}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {asset.deposits?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <DepositLink
                    deposit={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={depositLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {asset.withdrawals?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.asset.fields.withdrawals}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {asset.withdrawals?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <WithdrawalLink
                    withdrawal={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={withdrawalLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {asset.snapshots?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.asset.fields.snapshots}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {asset.snapshots?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <BalanceSnapshotLink
                    balanceSnapshot={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={balanceSnapshotLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {asset.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={asset.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  asset.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {asset.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(asset.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(asset.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {asset.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={asset.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  asset.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {asset.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(asset.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(asset.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {asset.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={asset.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  asset.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {asset.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.asset.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(asset.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(asset.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
