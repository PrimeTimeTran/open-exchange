import { AppContext } from 'src/shared/controller/appContext';
import { prismaDangerouslyBypassAuth } from 'src/prisma';

export async function walletCreateDefault(userId: string, context: AppContext) {
  const prisma = prismaDangerouslyBypassAuth(context);

  // 1. Find Membership (and Tenant)
  // Assuming single tenant mode implies we want the membership for that single tenant.
  const membership = await prisma.membership.findFirst({
    where: { userId },
  });

  if (!membership || !membership.tenantId) {
    console.warn(`walletCreateDefault: No membership found for user ${userId}`);
    return;
  }

  const tenantId = membership.tenantId;

  // 2. Find or Create "SPOT" Account
  // Note: Account.userId links to Membership.id in the schema
  let account = await prisma.account.findFirst({
    where: {
      userId: membership.id,
      type: 'SPOT',
      tenantId,
    },
  });

  if (!account) {
    try {
      account = await prisma.account.create({
        data: {
          name: 'Spot Account',
          type: 'SPOT',
          isSystem: false,
          tenantId,
          userId: membership.id,
        },
      });
    } catch (error) {
      console.error('Error creating default account:', error);
      return;
    }
  }

  // 3. Find Assets (USD, BTC, ETH)
  const assets = await prisma.asset.findMany({
    where: {
      tenantId,
      symbol: { in: ['USD', 'BTC', 'ETH'] },
    },
  });

  // 4. Create Wallets
  for (const asset of assets) {
    const wallet = await prisma.wallet.findFirst({
      where: {
        accountId: account.id,
        assetId: asset.id,
      },
    });

    if (!wallet) {
      try {
        await prisma.wallet.create({
          data: {
            tenantId,
            accountId: account.id,
            assetId: asset.id,
            available: 0,
            locked: 0,
            total: 0,
            userId: membership.id, // Set the userId (Membership ID)
          },
        });
      } catch (error) {
        console.error(
          `Error creating wallet for asset ${asset.symbol}:`,
          error,
        );
      }
    }
  }
}
