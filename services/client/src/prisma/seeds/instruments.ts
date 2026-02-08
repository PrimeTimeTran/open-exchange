import { PrismaClient } from '@prisma/client';

export async function seedInstruments(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  const instrumentsData = [
    { symbol: 'BTC_USD', base: 'BTC', quote: 'USD', type: 'spot' },
    { symbol: 'ETH_USD', base: 'ETH', quote: 'USD', type: 'spot' },
    { symbol: 'AAPL_USD', base: 'AAPL', quote: 'USD', type: 'spot' },
    {
      symbol: 'AAPL_25JUN21_150_C',
      base: 'AAPL',
      quote: 'USD',
      type: 'option',
      meta: { expiry: '2029-06-21', strike: 150, optionType: 'call' },
    },
    {
      symbol: 'BTC_25JUN26',
      base: 'BTC',
      quote: 'USD',
      type: 'future',
      meta: { expiry: '2029-06-26' },
    },
  ];

  for (const instData of instrumentsData) {
    const existing = await prisma.instrument.findFirst({
      where: {
        tenantId,
        symbol: instData.symbol,
      },
    });

    if (existing) {
      console.log(`Instrument ${instData.symbol} already exists.`);
    } else {
      const baseAsset = assetsMap.get(instData.base);
      const quoteAsset = assetsMap.get(instData.quote);

      if (baseAsset && quoteAsset) {
        console.log(`Creating instrument ${instData.symbol}...`);
        await prisma.instrument.create({
          data: {
            tenantId,
            symbol: instData.symbol,
            underlyingAssetId: baseAsset.id,
            quoteAssetId: quoteAsset.id,
            status: 'active',
            type: instData.type,
            meta: instData.meta,
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        });
      }
    }
  }
}
