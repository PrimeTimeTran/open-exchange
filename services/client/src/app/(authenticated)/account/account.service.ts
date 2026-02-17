import { prisma } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { marketClient } from 'src/services/MarketClient';

export async function getAccountPageData(context: AppContext) {
  const { currentMembership, currentTenant } = context;

  if (!currentMembership || !currentTenant) {
    throw new Error('Authenticated context required');
  }

  const tenantId = currentTenant.id;
  const membershipId = currentMembership.id;

  // 1. Fetch Wallets (Balances)
  // Only show wallets with non-zero balance OR base currencies (USD, BTC, ETH)
  const wallets = await prisma.wallet.findMany({
    where: {
      tenantId,
      userId: membershipId,
      account: {
        isSystem: false,
      },
      OR: [
        { total: { gt: 0 } },
        { asset: { symbol: { in: ['USD', 'BTC', 'ETH'] } } },
      ],
    },
    include: {
      asset: true,
    },
  });

  const balances = await Promise.all(
    wallets.map(async (w) => {
      const decimals = w.asset?.decimals || 0;
      const amount = Number(w.available || 0) / Math.pow(10, decimals);
      const symbol = w.asset?.symbol || 'USD';
      const klass = w.asset?.klass || 'other';

      let price = 1;

      // Force stablecoins to $1.00
      if (['USDT', 'USDC', 'DAI'].includes(symbol)) {
        price = 1.0;
      }
      // Fetch real price for crypto assets
      else if (klass === 'crypto' && symbol !== 'USD') {
        try {
          const priceData = await marketClient.getLatestPrice({
            symbol: `${symbol}_USD`,
          });
          price = parseFloat(priceData.price || '0');
        } catch (e) {
          // Fallback or keep default 1 if failed (though 0 might be safer for value calc)
          // For account page display, defaulting to 0 or cached price might be better
          // but for consistency with investing page logic:
          price = 0;
        }
      }

      // Fallback for ETH/BTC if price fetch failed completely (optional, but good for dev experience if Market Service is down)
      if (price === 0) {
        if (symbol === 'ETH') price = 2200;
        if (symbol === 'BTC') price = 42000;
      }

      return {
        asset: symbol,
        name: (w.asset?.meta as any)?.name || symbol,
        klass,
        amount: amount,
        value: amount * price,
        decimals: decimals,
      };
    }),
  );

  // 2. Fetch Orders
  const ordersRaw = await prisma.order.findMany({
    where: {
      tenantId,
      account: {
        userId: membershipId,
      },
    },
    include: {
      instrument: true,
      fills: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  const orders = ordersRaw.map((o) => ({
    id: o.id,
    side: o.side || '',
    type: o.type || '',
    price: Number(o.price || 0),
    quantity: Number(o.quantity || 0),
    quantityFilled: Number(o.quantityFilled || 0),
    status: o.status || '',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    instrument: { symbol: o.instrument?.symbol || 'Unknown' },
    fills: o.fills.map((f) => ({
      quantity: Number(f.quantity || 0),
      price: Number(f.price || 0),
      fee: Number(f.fee || 0) / Math.pow(10, 6), // Assuming fee in quote asset 6 decimals for now
      feeCurrency: f.feeCurrency || '',
      createdAt: f.createdAt,
    })),
  }));

  // 3. Fetch Deposits
  const depositsRaw = await prisma.deposit.findMany({
    where: {
      tenantId,
      account: {
        userId: membershipId,
      },
    },
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  const deposits = depositsRaw.map((d) => ({
    id: d.id,
    amount: Number(d.amount || 0) / Math.pow(10, d.asset?.decimals || 0),
    status: d.status || '',
    chain: d.chain || '',
    txHash: d.txHash || '',
    createdAt: d.createdAt,
    asset: { symbol: d.asset?.symbol || 'Unknown' },
  }));

  // 4. Fetch Withdrawals
  const withdrawalsRaw = await prisma.withdrawal.findMany({
    where: {
      tenantId,
      account: {
        userId: membershipId,
      },
    },
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  const withdrawals = withdrawalsRaw.map((w) => ({
    id: w.id,
    amount: Number(w.amount || 0) / Math.pow(10, w.asset?.decimals || 0),
    status: w.status || '',
    destinationAddress: w.destinationAddress || '',
    chain: w.chain || '',
    txHash: w.txHash || '',
    createdAt: w.createdAt,
    asset: { symbol: w.asset?.symbol || 'Unknown' },
  }));

  // 5. Fetch Available Assets
  const availableAssetsRaw = await prisma.asset.findMany({
    where: {
      tenantId,
    },
    select: {
      symbol: true,
    },
  });
  const availableAssets = availableAssetsRaw.map((a) => a.symbol);

  return {
    balances,
    orders,
    deposits,
    withdrawals,
    availableAssets,
  };
}
