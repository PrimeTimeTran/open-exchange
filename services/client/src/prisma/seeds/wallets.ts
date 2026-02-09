import { PrismaClient } from '@prisma/client';

export async function seedWallets(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  const balances = [
    { asset: 'USD', amount: 1000000 * 100 }, // 1M USD * 10^2 decimals
    { asset: 'BTC', amount: 10 * 100000000 }, // 10 BTC * 10^8 decimals
    { asset: 'ETH', amount: 100000000000000000000 }, // 100 ETH * 10^18 decimals
    { asset: 'AAPL', amount: 500 * 100 }, // 500 Shares * 10^2 decimals
  ];

  for (const balance of balances) {
    const asset = assetsMap.get(balance.asset);
    if (asset) {
      // Create separate accounts for each asset context as requested.
      // USD -> USD (Funding)
      // BTC -> BTC_USD (Trading)
      // ETH -> ETH_USD (Trading)
      // AAPL -> AAPL_USD (Trading)

      let accountName =
        balance.asset === 'USD' ? 'USD' : `${balance.asset}_USD`;
      let accountType = balance.asset === 'USD' ? 'cash' : 'custody';

      let account = await prisma.account.findFirst({
        where: {
          tenantId,
          userId: membershipId,
          name: accountName,
        },
      });

      if (!account) {
        console.log(`Creating ${accountName} account for user...`);
        account = await prisma.account.create({
          data: {
            name: accountName,
            tenantId,
            userId: membershipId,
            type: accountType,
            status: 'active',
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        });
      }

      const existingWallet = await prisma.wallet.findFirst({
        where: {
          tenantId,
          accountId: account.id,
          assetId: asset.id,
        },
      });

      if (!existingWallet) {
        console.log(
          `Creating wallet for ${balance.asset} with ${balance.amount}...`,
        );
        await prisma.wallet.create({
          data: {
            tenantId,
            locked: 0,
            version: 1,
            userId: membershipId,
            accountId: account.id,
            assetId: asset.id,
            available: balance.amount,
            total: balance.amount,
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        });
      } else {
        console.log(`Wallet for ${balance.asset} already exists.`);
      }
    }
  }
}
