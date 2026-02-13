import { PrismaClient } from '@prisma/client';
import { createDeposit } from './seedUtils';

export async function seedSystemAccounts(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  const systemAccounts = [
    { name: 'btc_hot_wallet', asset: 'BTC', type: 'custody' },
    { name: 'eth_hot_wallet', asset: 'ETH', type: 'custody' },
    { name: 'openc_reserve', asset: 'OPENC', type: 'cash' },
    { name: 'usd_operational', asset: 'USD', type: 'cash' },
    { name: 'fees_account', asset: 'USD', type: 'fees' },
    { name: 'clearing_account', asset: 'USD', type: 'clearing' },
  ];

  for (const accountData of systemAccounts) {
    // Check if account exists
    let account = await prisma.account.findFirst({
      where: {
        tenantId,
        name: accountData.name,
        isSystem: true,
      },
    });

    if (account) {
      console.log(`System Account ${accountData.name} already exists.`);
    } else {
      console.log(`Creating System Account ${accountData.name}...`);
      account = await prisma.account.create({
        data: {
          tenant: { connect: { id: tenantId } }, // Relation fix
          name: accountData.name,
          type: accountData.type,
          status: 'active',
          isSystem: true,
          isInterest: false,
          createdByMembership: { connect: { id: membershipId } }, // Relation fix
          updatedByMembership: { connect: { id: membershipId } }, // Relation fix
          createdByUserId: userId, // Scalar, no change needed
          updatedByUserId: userId, // Scalar, no change needed
        },
      });
    }

    // Ensure Wallet exists for the associated asset
    if (assetsMap.has(accountData.asset)) {
      const asset = assetsMap.get(accountData.asset);

      const existingWallet = await prisma.wallet.findFirst({
        where: {
          tenantId,
          accountId: account.id,
          assetId: asset.id,
        },
      });

      if (!existingWallet) {
        console.log(
          `Creating wallet for System Account ${accountData.name} (${accountData.asset})...`,
        );

        const wallet = await prisma.wallet.create({
          data: {
            tenant: { connect: { id: tenantId } }, // Relation fix if tenant is a relation
            account: { connect: { id: account.id } }, // Relation fix
            asset: { connect: { id: asset.id } }, // Relation fix
            available: 100_000_000, // Adjust for decimals if needed
            total: 100_000_000,
            locked: 0,
            version: 1,
            createdByMembership: { connect: { id: membershipId } }, // Relation fix
            updatedByMembership: { connect: { id: membershipId } }, // Relation fix
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        });

        console.log(
          `Creating initial deposit for System Account ${accountData.name}...`,
        );
        await createDeposit(
          prisma,
          tenantId,
          membershipId,
          userId,
          account.id,
          asset.id,
          100_000_000,
          'system_init',
        );
      } else {
        console.log(
          `Wallet for System Account ${accountData.name} (${accountData.asset}) already exists.`,
        );
      }
    } else {
      console.log(
        `Asset ${accountData.asset} not found for System Account ${accountData.name}, skipping wallet.`,
      );
    }
  }
}
