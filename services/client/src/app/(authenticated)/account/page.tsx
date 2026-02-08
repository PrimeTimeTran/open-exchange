import React from 'react';
import { cookies } from 'next/headers';
import { AccountClient } from './account-client';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getAccountPageData } from './account.service';

export default async function AccountPage() {
  const context = await appContextForReact(cookies());

  if (!context.currentMembership || !context.currentTenant) {
    return null;
  }

  const { balances, orders, deposits, withdrawals, availableAssets } =
    await getAccountPageData(context);

  console.log({ balances, orders, deposits, withdrawals, availableAssets });

  return (
    <AccountClient
      orders={orders}
      balances={balances}
      deposits={deposits}
      assets={availableAssets}
      withdrawals={withdrawals}
    />
  );
}
