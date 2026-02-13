import { OrderType } from '@/proto/common/order'; // Import Enum

import { PrismaClient, Prisma } from '@prisma/client';
import { seedUser } from './user';
import {
  ensureAccount,
  ensureWallet,
  createDeposit,
  createWithdrawal,
} from './seedUtils';

const randomRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) =>
  Math.floor(randomRange(min, max));

export const seedUserWithData = async (
  prisma: PrismaClient,
  email: string,
  initialData: {
    deposits: { assetSymbol: string; amount: number; txHash?: string }[];
    withdrawals?: { assetSymbol: string; amount: number; txHash?: string }[];
    openOrders: {
      instrumentId: string;
      status: string;
      side: string;
      price: number;
      quantity: number;
      quantityFilled?: number;
    }[];
  },
  tenantId: string,
  assetsMap: Map<string, any>,
  instruments: any[],
) => {
  const user = await seedUser(prisma, email);
  console.log(`Seeding data for ${email}...`);

  let membership = await prisma.membership.findFirst({
    where: { userId: user.id, tenantId },
  });

  if (!membership) {
    membership = await prisma.membership.create({
      data: {
        userId: user.id,
        tenantId: tenantId,
        roles: ['user'],
        status: 'active',
        firstName: 'Seed',
        lastName: 'User',
        fullName: 'Seed User',
        createdByUserId: user.id,
        updatedByUserId: user.id,
        createdByMembershipId: null,
        updatedByMembershipId: null,
      },
    });
  }

  const usd = assetsMap.get('USD');
  // Create/Ensure a single Main Trading Account for the user
  let mainAccount = await ensureAccount(
    prisma,
    tenantId,
    membership.id,
    user.id,
    'USD', // Use 'USD' to trigger the "USD" / "cash" account type creation which will serve as the main account
  );
  // Ensure wallets exist for all assets in the system (initially 0 balance)
  const assetIds = new Set<string>();
  instruments.forEach((inst) => {
    if (inst.underlyingAssetId) assetIds.add(inst.underlyingAssetId);
    if (inst.quoteAssetId) assetIds.add(inst.quoteAssetId);
  });

  for (const assetId of Array.from(assetIds)) {
    await ensureWallet(
      prisma,
      tenantId,
      membership.id,
      user.id,
      mainAccount.id,
      assetId,
      0,
      { increment: true },
    );
  }
  // Process Deposits
  for (const deposit of initialData.deposits) {
    const asset = assetsMap.get(deposit.assetSymbol);
    if (!asset) {
      console.warn(`Asset ${deposit.assetSymbol} not found. Skipping deposit.`);
      continue;
    }

    // Always use the main account for all wallets
    const account = mainAccount;

    if (deposit.amount > 0) {
      const amount = new Prisma.Decimal(deposit.amount)
        .mul(new Prisma.Decimal(10).pow(asset.decimals))
        .floor();

      await ensureWallet(
        prisma,
        tenantId,
        membership.id,
        user.id,
        account.id,
        asset.id,
        amount,
        { increment: true },
      );

      await createDeposit(
        prisma,
        tenantId,
        membership.id,
        user.id,
        account.id,
        asset.id,
        amount,
        deposit.txHash ||
          `seed_${email}_${
            deposit.assetSymbol
          }_dep_${Date.now()}_${Math.random()}`,
      );
    }
  }

  // Process Withdrawals
  if (initialData.withdrawals) {
    for (const withdrawal of initialData.withdrawals) {
      const asset = assetsMap.get(withdrawal.assetSymbol);
      if (!asset) {
        console.warn(
          `Asset ${withdrawal.assetSymbol} not found. Skipping withdrawal.`,
        );
        continue;
      }

      // Use the main account for withdrawals to match deposits
      const account = mainAccount;

      if (withdrawal.amount > 0) {
        const amount = new Prisma.Decimal(withdrawal.amount)
          .mul(new Prisma.Decimal(10).pow(asset.decimals))
          .floor();

        // Decrement wallet balance
        await ensureWallet(
          prisma,
          tenantId,
          membership.id,
          user.id,
          account.id,
          asset.id,
          amount.negated(), // Negative for withdrawal
          { increment: true },
        );

        await createWithdrawal(
          prisma,
          tenantId,
          membership.id,
          user.id,
          account.id,
          asset.id,
          amount,
          withdrawal.txHash ||
            `seed_${email}_${
              withdrawal.assetSymbol
            }_wth_${Date.now()}_${Math.random()}`,
        );
      }
    }
  }

  // Fallback main account
  if (!mainAccount && usd) {
    mainAccount = await ensureAccount(
      prisma,
      tenantId,
      membership.id,
      user.id,
      'USD',
    );
  }

  if (mainAccount) {
    // Create Orders
    for (const order of initialData.openOrders) {
      const inst = instruments.find((i) => i.id === order.instrumentId);
      if (!inst) {
        console.warn(`Instrument ${order.instrumentId} not found for order.`);
        continue;
      }

      console.log(
        `Processing Order for ${inst.symbol}: P=${order.price}, Q=${order.quantity}`,
      );
      console.log(
        `Assets loaded? Base: ${!!inst.underlyingAsset}, Quote: ${!!inst.quoteAsset}`,
      );

      let finalPrice = order.price;
      let finalQty = order.quantity;

      if (inst.underlyingAsset && inst.quoteAsset) {
        const baseDec = inst.underlyingAsset.decimals;
        const quoteDec = inst.quoteAsset.decimals;

        // Note: We use Human Readable values for Order persistence (finalPrice, finalQty are already set correctly above)
        // We only need scaling for Wallet Locking (Atomic Units).

        console.log(`Order Values: Price=${finalPrice}, Qty=${finalQty}`);

        // Lock Funds Logic
        let lockedAmount = new Prisma.Decimal(0);
        let lockAssetId = '';
        let lockAccount = mainAccount;

        // Only simulate locking for SPOT instruments for now
        if (inst.type === 'spot') {
          if (order.side === 'buy') {
            lockedAmount = new Prisma.Decimal(order.price)
              .mul(new Prisma.Decimal(order.quantity))
              .mul(new Prisma.Decimal(10).pow(quoteDec))
              .floor();
            lockAssetId = inst.quoteAssetId;
          } else {
            lockedAmount = new Prisma.Decimal(order.quantity)
              .mul(new Prisma.Decimal(10).pow(baseDec))
              .floor();
            lockAssetId = inst.underlyingAssetId;
            // lockAccount is already mainAccount, no need to switch
          }
        }

        await prisma.$transaction(async (tx) => {
          await tx.$executeRaw`SELECT set_config('app.current_user_id', ${user.id}::text, true)`;
          await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}::text, true)`;
          await tx.$executeRaw`SELECT set_config('app.current_membership_id', ${membership.id}::text, true)`;

          if (lockAccount && lockAssetId && lockedAmount.gt(0)) {
            const decimalLock = lockedAmount;
            await tx.wallet.updateMany({
              where: {
                tenantId,
                accountId: lockAccount.id,
                assetId: lockAssetId,
              },
              data: {
                locked: { increment: decimalLock },
                available: { decrement: decimalLock },
              },
            });
          }

          await tx.order.create({
            data: {
              tenant: { connect: { id: tenantId } },
              account: { connect: { id: mainAccount.id } },
              instrument: { connect: { id: inst.id } },
              side: order.side,
              status: order.status,
              price: finalPrice,
              quantity: finalQty,
              timeInFore: 'gtc',
              createdAt: new Date(),
              createdByMembership: { connect: { id: membership.id } },
              updatedByMembership: { connect: { id: membership.id } },
              quantityFilled: order.quantityFilled || 0,
              type: OrderType[OrderType.ORDER_TYPE_LIMIT],
            },
          });
        });
      }
    }
  }

  return { user, membership };
};

export async function seedPlatformUsers(
  prisma: PrismaClient,
  tenantId: string,
  assetsMap: Map<string, any>,
) {
  const instruments = await prisma.instrument.findMany({
    include: { underlyingAsset: true, quoteAsset: true },
  });

  const getBasePrice = (symbol: string, type: string) => {
    if (type === 'option') return randomRange(5, 50); // Option premium
    if (type === 'future') {
      // Future price similar to spot but slightly different
      if (symbol.includes('BTC')) return 65500;
      if (symbol.includes('ETH')) return 3550;
      if (symbol.includes('AAPL')) return 175;
      return 100;
    }
    // Spot Prices
    if (symbol.includes('BTC')) return 65000;
    if (symbol.includes('ETH')) return 3500;
    if (symbol.includes('OPENC')) return 10;
    if (symbol.includes('AAPL')) return 170;
    if (symbol.includes('TSLA')) return 220;
    if (symbol.includes('MSFT')) return 400;
    if (symbol.includes('GOOGL')) return 160;
    if (symbol.includes('META')) return 480;
    if (symbol.includes('SPY')) return 500;
    return 100;
  };

  for (let i = 1; i <= 5; i++) {
    const initialFundsMap = new Map<string, number>();
    // Default USD between 50k and 1M, but boost first two users to 1M-5M
    if (i === 1 || i === 2) {
      initialFundsMap.set('USD', randomInt(1_000_000, 5_000_000));
    } else {
      initialFundsMap.set('USD', randomInt(50000, 1000000));
    }

    const numOrders = randomInt(3, 8);
    const openOrders: any[] = [];

    for (let j = 0; j < numOrders; j++) {
      const instrument = instruments[randomInt(0, instruments.length)];
      if (!instrument) continue;

      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const basePrice = getBasePrice(instrument.symbol, instrument.type!);
      // Randomize price within +/- 5% of base
      let price = basePrice * randomRange(0.95, 1.05);
      price = parseFloat(price.toFixed(6));

      let quantity;
      if (instrument.type === 'option' || instrument.type === 'future') {
        quantity = randomInt(1, 10);
      } else {
        // For crypto/stocks, use smaller amounts for high price assets
        if (basePrice > 1000) {
          quantity = randomRange(0.1, 2.0);
        } else {
          quantity = randomInt(1, 50);
        }
      }
      quantity = parseFloat(Number(quantity).toFixed(6));

      if (side === 'sell' && instrument.type === 'spot') {
        const baseSymbol = instrument.underlyingAsset?.symbol;
        if (baseSymbol) {
          const current = initialFundsMap.get(baseSymbol) || 0;
          initialFundsMap.set(baseSymbol, current + quantity * 1.5); // Add 1.5x quantity to be safe
        }
      } else if (side === 'buy') {
        const quoteSymbol = instrument.quoteAsset?.symbol;
        if (quoteSymbol) {
          const cost = price * quantity;
          const current = initialFundsMap.get(quoteSymbol) || 0;
          initialFundsMap.set(quoteSymbol, current + cost * 1.5); // Add 1.5x cost to be safe
        }
      }

      openOrders.push({
        side,
        price,
        quantity,
        status: 'open',
        instrumentId: instrument.id,
      });
    }

    // Ensure first two seeded users have explicit buy orders for BTC to be able to fill large sell
    const btcInstrument = instruments.find((it) => it.symbol.includes('BTC'));
    const ethInstrument = instruments.find((it) => it.symbol.includes('ETH'));

    if (i === 1 && btcInstrument) {
      // 1. Match with 100k BTC sell order
      openOrders.push({
        instrumentId: btcInstrument.id,
        status: 'open',
        side: 'buy',
        price: 100_000,
        quantity: 5,
      });

      // 2. Match with 150k BTC sell order (1 BTC)
      openOrders.push({
        instrumentId: btcInstrument.id,
        status: 'open',
        side: 'buy',
        price: 150_000,
        quantity: 1,
      });
    }

    if (i === 2 && btcInstrument) {
      // 1. Match with 100k BTC sell order
      openOrders.push({
        instrumentId: btcInstrument.id,
        status: 'open',
        side: 'buy',
        price: 100_000,
        quantity: 5,
      });
    }

    if (i === 2 && ethInstrument) {
      // 2. Match with 10k ETH sell order (5 ETH)
      openOrders.push({
        instrumentId: ethInstrument.id,
        status: 'open',
        side: 'buy',
        price: 10_000,
        quantity: 5,
      });
    }

    const initialFunds = Array.from(initialFundsMap.entries()).map(
      ([assetSymbol, amount]) => ({ assetSymbol, amount }),
    );

    await seedUserWithData(
      prisma,
      `primetimetran${i}@gmail.com`,
      {
        deposits: initialFunds,
        openOrders,
      },
      tenantId,
      assetsMap,
      instruments,
    );
  }
}
