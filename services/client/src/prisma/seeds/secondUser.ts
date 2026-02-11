import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedSecondUser(
  prisma: PrismaClient,
  tenantId: string,
  assetsMap: Map<string, any>,
) {
  console.log('Seeding Second User (primetimetran1)...');
  const email = 'primetimetran1@gmail.com';

  // 1. User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('Asdf!123', 10),
        emailVerified: true,
      },
    });
  }

  // 2. Membership
  let membership = await prisma.membership.findFirst({
    where: { userId: user.id, tenantId },
  });
  if (!membership) {
    membership = await prisma.membership.create({
      data: {
        userId: user.id,
        tenantId,
        roles: ['admin'],
        status: 'active',
        firstName: 'Prime',
        lastName: 'Time',
        fullName: 'Prime Time',
        createdByUserId: user.id,
        updatedByUserId: user.id,
        createdByMembershipId: null,
        updatedByMembershipId: null,
      },
    });
  }

  const commonData = {
    tenantId,
    createdByMembershipId: membership.id,
    updatedByMembershipId: membership.id,
    createdByUserId: user.id,
    updatedByUserId: user.id,
  };

  // 3. Account & Wallet (USD)
  const usdAsset = assetsMap.get('USD');
  if (usdAsset) {
    let account = await prisma.account.findFirst({
      where: { tenantId, userId: membership.id, name: 'USD' },
    });
    if (!account) {
      account = await prisma.account.create({
        data: {
          name: 'USD',
          tenantId,
          userId: membership.id,
          type: 'cash',
          status: 'active',
          ...commonData,
        },
      });
    }

    // Deposit Amount: 10,000,000 USD
    const depositAmount = 10000000;
    const decimals = usdAsset.decimals || 2;
    const atomicAmount = BigInt(depositAmount * Math.pow(10, decimals));

    let wallet = await prisma.wallet.findFirst({
      where: { accountId: account.id, assetId: usdAsset.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          tenantId,
          accountId: account.id,
          assetId: usdAsset.id,
          available: atomicAmount.toString(),
          total: atomicAmount.toString(),
          locked: 0,
          version: 1,
          userId: membership.id,
          ...commonData,
        },
      });
    }

    // 4. Deposit Record
    const txHash = 'seed_deposit_user2_usd_10m';
    const existingDeposit = await prisma.deposit.findFirst({
      where: { txHash },
    });
    if (!existingDeposit) {
      await prisma.deposit.create({
        data: {
          tenantId,
          accountId: account.id,
          assetId: usdAsset.id,
          amount: atomicAmount.toString(),
          status: 'completed',
          txHash,
          chain: 'mainnet',
          ...commonData,
        },
      });
    }

    // 5. Bid Limit Order BTC_USD at $30,000 (Open)
    const instrument = await prisma.instrument.findFirst({
      where: { symbol: 'BTC_USD' },
      include: { underlyingAsset: true, quoteAsset: true },
    });

    if (instrument && instrument.quoteAsset && instrument.underlyingAsset) {
      const price = 30000;
      const quantity = 1; // 1 BTC

      const baseDec = instrument.underlyingAsset.decimals;
      const quoteDec = instrument.quoteAsset.decimals;

      const priceScale = Math.pow(10, quoteDec - baseDec);
      const finalPrice = price * priceScale;

      const qtyScale = Math.pow(10, baseDec);
      const finalQty = quantity * qtyScale;

      // Check if order already exists to avoid duplicates on re-seed
      // We can't easily check by ID since we don't set it, but we can check by open status + price + user
      const existingOrder = await prisma.order.findFirst({
        where: {
          accountId: account.id, // Use USD account for Buy order funding?
          // Actually, orders are typically linked to a specific account.
          // If we look at seedOrders.ts, it uses 'mainAccount'.
          // Here we have 'account' which is the USD account.
          // Does the system require a specific Trading Account?
          // Wallets.ts created "BTC_USD" account for trading?
          // "USD -> USD (Funding)", "BTC -> BTC_USD (Trading)"
          // If the order is for BTC_USD, maybe it should be linked to the BTC_USD account?
          // But the funds (USD) are in the USD account.
          // Let's check wallets.ts again.
          // "BTC -> BTC_USD (Trading)"
          // "ETH -> ETH_USD (Trading)"
          // It seems trading accounts are per asset? That's a bit weird for a pair.
          // Usually you have one account for the user that holds multiple wallets.
          // Or one Trading Account that holds multiple wallets.
          // wallets.ts creates separate accounts per asset.
          // Let's use the USD account since that's where the money is.
          instrumentId: instrument.id,
          status: 'open',
          price: finalPrice,
          side: 'buy',
        },
      });

      if (!existingOrder) {
        await prisma.order.create({
          data: {
            tenantId,
            accountId: account.id,
            instrumentId: instrument.id,
            side: 'buy',
            type: 'limit',
            status: 'open',
            price: finalPrice,
            quantity: finalQty,
            quantityFilled: 0,
            timeInFore: 'gtc',
            ...commonData,
            createdAt: new Date(),
          },
        });

        // Update wallet to lock funds
        const lockAmountAtomic = BigInt(
          price * quantity * Math.pow(10, decimals),
        ); // 30000 * 100 = 3000000
        // NOTE: quoteDec is 2 (USD), so Math.pow(10, 2) = 100.
        // 30000 * 1 * 100 = 3,000,000 atomic units.

        // Check if wallet has enough available (it should, 10M > 30k)
        const currentAvailable = BigInt(wallet.available);
        const currentLocked = BigInt(wallet.locked);

        if (currentAvailable >= lockAmountAtomic) {
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: {
              available: (currentAvailable - lockAmountAtomic).toString(),
              locked: (currentLocked + lockAmountAtomic).toString(),
              version: { increment: 1 },
            },
          });
          console.log(
            `Created Open Bid for ${quantity} BTC at $${price} and locked funds.`,
          );
        } else {
          console.warn(
            'Not enough funds to lock for seeded order, but order created anyway.',
          );
        }
      } else {
        console.log('Seeded order for User 2 already exists.');
      }
    }
  }
}
