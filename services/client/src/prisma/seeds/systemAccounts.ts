import { PrismaClient } from '@prisma/client';
import { createDeposit } from './seedUtils';
import { SYSTEM_ACCOUNTS } from '../../constants/system-accounts';

export async function seedSystemAccounts(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  for (const accountData of SYSTEM_ACCOUNTS) {
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
          meta:
            accountData.network || accountData.address
              ? {
                  ...(accountData.network
                    ? { network: accountData.network }
                    : {}),
                  ...(accountData.address
                    ? { address: accountData.address }
                    : {}),
                }
              : undefined,
          createdByMembership: { connect: { id: membershipId } }, // Relation fix
          updatedByMembership: { connect: { id: membershipId } }, // Relation fix
          createdByUserId: userId, // Scalar, no change needed
          updatedByUserId: userId, // Scalar, no change needed
        },
      });
    }

    // If account type is 'fees' or 'clearing', ensure wallets for ALL assets exist
    if (accountData.type === 'fees' || accountData.type === 'clearing') {
      console.log(
        `Ensuring all asset wallets for System Account ${accountData.name} (${accountData.type})...`,
      );
      for (const asset of assetsMap.values()) {
        const existingWallet = await prisma.wallet.findFirst({
          where: {
            tenantId,
            accountId: account.id,
            assetId: asset.id,
          },
        });

        if (!existingWallet) {
          await prisma.wallet.create({
            data: {
              tenant: { connect: { id: tenantId } },
              account: { connect: { id: account.id } },
              asset: { connect: { id: asset.id } },
              available: 0,
              total: 0,
              locked: 0,
              version: 1,
              createdByMembership: { connect: { id: membershipId } },
              updatedByMembership: { connect: { id: membershipId } },
              createdByUserId: userId,
              updatedByUserId: userId,
            },
          });
        }
      }
    } else if (assetsMap.has(accountData.asset)) {
      // Ensure Wallet exists for the specific associated asset
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
            available: 0,
            total: 0,
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
