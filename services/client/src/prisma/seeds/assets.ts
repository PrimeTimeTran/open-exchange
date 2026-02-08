import { PrismaClient } from '@prisma/client';

export async function seedAssets(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
) {
  const assetsData = [
    { symbol: 'USD', name: 'US Dollar', klass: 'fiat', decimals: 2 },
    { symbol: 'BTC', name: 'Bitcoin', klass: 'crypto', decimals: 8 },
    { symbol: 'ETH', name: 'Ethereum', klass: 'crypto', decimals: 18 },
    { symbol: 'AAPL', name: 'Apple Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      klass: 'etf',
      decimals: 2,
    },
    { symbol: 'OPENC', name: 'Open Coin', klass: 'crypto', decimals: 18 },
  ];

  const assetsMap = new Map();

  for (const assetData of assetsData) {
    const existing = await prisma.asset.findFirst({
      where: {
        tenantId,
        symbol: assetData.symbol,
      },
    });

    if (existing) {
      console.log(`Asset ${assetData.symbol} already exists.`);
      assetsMap.set(assetData.symbol, existing);
    } else {
      console.log(`Creating asset ${assetData.symbol}...`);
      const created = await prisma.asset.create({
        data: {
          tenantId,
          symbol: assetData.symbol,
          klass: assetData.klass,
          decimals: assetData.decimals,
          // meta: { name: assetData.name },
          createdByMembershipId: membershipId,
          updatedByMembershipId: membershipId,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      });
      assetsMap.set(assetData.symbol, created);
    }
  }
  return assetsMap;
}
