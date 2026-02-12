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
      type: string;
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
  let mainAccount;

  // Process Deposits
  for (const deposit of initialData.deposits) {
    const asset = assetsMap.get(deposit.assetSymbol);
    if (!asset) {
      console.warn(`Asset ${deposit.assetSymbol} not found. Skipping deposit.`);
      continue;
    }

    const account = await ensureAccount(
      prisma,
      tenantId,
      membership.id,
      user.id,
      deposit.assetSymbol,
    );

    if (deposit.assetSymbol === 'USD') {
      mainAccount = account;
    }

    if (deposit.amount > 0) {
      const amount = BigInt(
        Math.floor(deposit.amount * Math.pow(10, asset.decimals)),
      );

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

      const account = await ensureAccount(
        prisma,
        tenantId,
        membership.id,
        user.id,
        withdrawal.assetSymbol,
      );

      if (withdrawal.amount > 0) {
        const amount = BigInt(
          Math.floor(withdrawal.amount * Math.pow(10, asset.decimals)),
        );

        // Decrement wallet balance
        await ensureWallet(
          prisma,
          tenantId,
          membership.id,
          user.id,
          account.id,
          asset.id,
          -amount, // Negative for withdrawal
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

        // Fix: Use 20 decimal precision for calculation to avoid floating point issues
        // Price Atomic = Price Major * 10^(Q-B)
        // If Q-B is negative (e.g. 2-8 = -6), we are dividing by 10^6
        // 20000 * 10^-6 = 0.02

        const scaleFactor = quoteDec - baseDec;
        if (scaleFactor >= 0) {
          finalPrice = order.price * Math.pow(10, scaleFactor);
        } else {
          finalPrice = order.price / Math.pow(10, Math.abs(scaleFactor));
        }

        // Qty Atomic = Qty Major * 10^B
        finalQty = order.quantity * Math.pow(10, baseDec);

        console.log(`Scaled Values: Price=${finalPrice}, Qty=${finalQty}`);

        // Lock Funds Logic
        let lockedAmount = BigInt(0);
        let lockAssetId = '';
        let lockAccount = mainAccount;

        if (order.side === 'buy') {
          lockedAmount = BigInt(
            Math.floor(order.price * order.quantity * Math.pow(10, quoteDec)),
          );
          lockAssetId = inst.quoteAssetId;
        } else {
          lockedAmount = BigInt(
            Math.floor(order.quantity * Math.pow(10, baseDec)),
          );
          lockAssetId = inst.underlyingAssetId;

          const lockAssetSymbol = inst.underlyingAsset.symbol;
          if (lockAssetSymbol !== 'USD') {
            lockAccount = await ensureAccount(
              prisma,
              tenantId,
              membership.id,
              user.id,
              lockAssetSymbol,
            );
          }
        }

        if (lockAccount && lockAssetId && lockedAmount > 0) {
          const decimalLock = new Prisma.Decimal(lockedAmount.toString());
          await prisma.wallet.updateMany({
            where: {
              tenantId,
              accountId: lockAccount.id,
              assetId: lockAssetId,
            },
            data: {
              available: { decrement: decimalLock },
              locked: { increment: decimalLock },
            },
          });
        }
      }

      await prisma.order.create({
        data: {
          tenantId,
          accountId: mainAccount.id,
          instrumentId: inst.id,
          side: order.side,
          type: 'limit',
          status: order.status,
          price: finalPrice,
          quantity: finalQty,
          quantityFilled: 0,
          timeInFore: 'gtc',
          createdAt: new Date(),
          createdByMembershipId: membership.id,
          updatedByMembershipId: membership.id,
          createdByUserId: user.id,
          updatedByUserId: user.id,
        },
      });
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
    initialFundsMap.set('USD', randomInt(50000, 1000000));

    const numOrders = randomInt(3, 8);
    const openOrders: any[] = [];

    for (let j = 0; j < numOrders; j++) {
      const instrument = instruments[randomInt(0, instruments.length)];
      if (!instrument) continue;

      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const basePrice = getBasePrice(instrument.symbol, instrument.type!);
      // Randomize price within +/- 5% of base
      const price = basePrice * randomRange(0.95, 1.05);

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

      if (side === 'sell' && instrument.type === 'spot') {
        const baseSymbol = instrument.underlyingAsset?.symbol;
        if (baseSymbol) {
          const current = initialFundsMap.get(baseSymbol) || 0;
          initialFundsMap.set(baseSymbol, current + quantity * 1.5); // Add 1.5x quantity to be safe
        }
      }

      openOrders.push({
        instrumentId: instrument.id,
        status: 'open',
        side,
        price,
        quantity,
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
