import { PrismaClient } from '@prisma/client';

export async function seedSystemAccounts(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  const systemAccounts = [
    { name: 'btc_hot_wallet', asset: 'BTC' },
    { name: 'eth_hot_wallet', asset: 'ETH' },
    { name: 'openc_reserve', asset: 'OPENC' },
    { name: 'usd_operational', asset: 'USD' },
  ];

  for (const account of systemAccounts) {
    const existing = await prisma.systemAccount.findFirst({
      where: {
        tenantId,
        name: account.name,
      },
    });

    let sysAccountRecord;

    if (existing) {
      console.log(`System Account ${account.name} already exists.`);
      sysAccountRecord = existing;
    } else {
      console.log(`Creating System Account ${account.name}...`);
      sysAccountRecord = await prisma.systemAccount.create({
        data: {
          tenantId,
          name: account.name,
          type: 'system',
          isActive: true,
          createdByMembershipId: membershipId,
          updatedByMembershipId: membershipId,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      });
    }

    // Ensure Wallet exists
    if (assetsMap.has(account.asset)) {
      const asset = assetsMap.get(account.asset);
      const existingWallet = await prisma.wallet.findFirst({
        where: {
          tenantId,
          accountId: sysAccountRecord.id,
          assetId: asset.id,
        },
      });

      if (!existingWallet) {
        console.log(
          `Creating wallet for System Account ${account.name} (${account.asset})...`,
        );
        await prisma.wallet.create({
          data: {
            tenantId,
            accountId: sysAccountRecord.id,
            assetId: asset.id,
            available: 100000000, // Seed with plenty of funds
            total: 100000000,
            locked: 0,
            version: 1,
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        });
      } else {
        console.log(
          `Wallet for System Account ${account.name} (${account.asset}) already exists.`,
        );
      }
    } else {
      console.log(
        `Asset ${account.asset} not found for System Account ${account.name}, skipping wallet.`,
      );
    }
  }
}
