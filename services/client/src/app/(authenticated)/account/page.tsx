import React from 'react';
import { cookies } from 'next/headers';
import { AccountClient } from './account-client';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getAccountPageData } from './account.service';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const context = await appContextForReact(cookies());

  if (!context.currentMembership || !context.currentTenant) {
    return null;
  }

  const { balances, orders, deposits, withdrawals, availableAssets } =
    await getAccountPageData(context);

  const tab =
    typeof searchParams?.tab === 'string' ? searchParams.tab : undefined;
  const initialTab = tab === 'deposit' || tab === 'withdraw' ? tab : undefined;

  return (
    <AccountClient
      orders={orders}
      balances={balances}
      deposits={deposits}
      assets={availableAssets}
      withdrawals={withdrawals}
      initialTab={initialTab}
    />
  );
}
