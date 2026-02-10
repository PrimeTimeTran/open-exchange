'use server';

import { ledgerClient } from 'src/services/LedgerClient';
import { appContextForReact } from 'src/shared/controller/appContext';
import { cookies } from 'next/headers';

export async function getLedgerAccounts() {
  const context = await appContextForReact(cookies());
  if (!context.currentUser || !context.currentMembership) {
    return []; // Return empty if not authenticated
  }

  // Fetch accounts for the user (Membership)
  try {
    const response = await ledgerClient.listAccounts({
      userId: context.currentMembership.id,
    });

    return response.accounts || [];
  } catch (error: any) {
    console.error('Failed to fetch ledger accounts:', error);
    return [];
  }
}

export async function getLedgerWallets(accountId: string) {
  try {
    const response = await ledgerClient.listWallets({
      accountId,
    });

    const wallets = response.wallets || [];
    if (wallets.length === 0) return [];

    // Enrich with asset info using Ledger Service
    const assetsResponse = await ledgerClient.listAssets({ ids: [] });
    const assets = assetsResponse.assets || [];

    const assetMap = new Map(assets.map((a) => [a.id, a]));

    return wallets.map((w) => {
      const asset = w.assetId ? assetMap.get(w.assetId) : undefined;
      return {
        ...w,
        assetSymbol: asset?.symbol || 'Unknown',
        assetDecimals: asset?.decimals || 0,
      };
    });
  } catch (error: any) {
    console.error('Failed to fetch ledger wallets:', error);
    return [];
  }
}
// export async function getLedgerWallets(accountId: string) {
//   try {
//     const response = await ledgerClient.listWallets({
//       accountId,
//     });

//     const wallets = response.wallets || [];

//     // Enrich with asset info using Prisma
//     const assetIds = wallets.map((w) => w.assetId).filter((id): id is string => !!id);
//     const assets = await prisma.asset.findMany({
//       where: {
//         id: { in: assetIds },
//       },
//     });

//     const assetMap = new Map(assets.map((a) => [a.id, a]));

//     return wallets.map((w) => {
//       const asset = w.assetId ? assetMap.get(w.assetId) : undefined;
//       return {
//         ...w,
//         assetSymbol: asset?.symbol || 'Unknown',
//         assetDecimals: asset?.decimals || 0,
//       };
//     });
//   } catch (error: any) {
//     console.error('Failed to fetch ledger wallets:', error);
//     return [];
//   }
// }
