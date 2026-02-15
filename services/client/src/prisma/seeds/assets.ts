import { PrismaClient } from '@prisma/client';
import { assetsData } from './dataAssets';

export async function seedAssets(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
) {
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
          klass: assetData.klass,
          createdByUserId: userId,
          updatedByUserId: userId,
          symbol: assetData.symbol,
          decimals: assetData.decimals,
          createdByMembershipId: membershipId,
          updatedByMembershipId: membershipId,
        },
      });
      assetsMap.set(assetData.symbol, created);
    }
  }

  console.log('Assets Map Keys:', Array.from(assetsMap.keys()));

  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 6);
  const day = String(futureDate.getDate()).padStart(2, '0');
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const month = months[futureDate.getMonth()];
  const year = String(futureDate.getFullYear()).slice(-2);
  const dateStr = `${day}${month}${year}`;
  const expiryStr = futureDate.toISOString().split('T')[0];

  const instrumentsData: any[] = [];
  const quoteAssetUSD = assetsMap.get('USD');
  const quoteAssetUSDT = assetsMap.get('USDT');

  console.log('Quote Asset USD found:', !!quoteAssetUSD);
  console.log('Quote Asset USDT found:', !!quoteAssetUSDT);

  if (quoteAssetUSD) {
    console.log('Iterating assets to generate instruments...');
    const allAssets = Array.from(assetsMap.values());
    console.log(`Found ${allAssets.length} assets from map values.`);

    for (const asset of allAssets) {
      console.log(`Checking asset: ${asset.symbol} (ID: ${asset.id})`);
      if (asset.symbol === 'USD') continue;

      let quoteAsset = quoteAssetUSD;
      let quoteSymbol = 'USD';

      // If it's a crypto asset (except USDT itself), quote in USDT
      if (asset.klass === 'crypto' && asset.symbol !== 'USDT') {
        if (quoteAssetUSDT) {
          quoteAsset = quoteAssetUSDT;
          quoteSymbol = 'USDT';
        } else {
          console.warn(
            'USDT asset not found, falling back to USD quote for',
            asset.symbol,
          );
        }
      }

      // Create Spot Instrument for all assets
      instrumentsData.push({
        symbol: `${asset.symbol}_${quoteSymbol}`,
        base: asset.symbol,
        quote: quoteSymbol,
        type: 'spot',
        underlyingAssetId: asset.id,
        quoteAssetId: quoteAsset.id,
      });

      // Create Derivatives for Stocks
      if (asset.klass === 'stock') {
        // Future
        instrumentsData.push({
          symbol: `${asset.symbol}_25JUN26`,
          base: asset.symbol,
          quote: 'USD',
          type: 'future',
          underlyingAssetId: asset.id,
          quoteAssetId: quoteAssetUSD.id, // Derivatives usually quoted in USD
          meta: { expiry: '2026-06-25' },
        });

        // Options
        // Call
        instrumentsData.push({
          symbol: `${asset.symbol}_${dateStr}_150_C`,
          base: asset.symbol,
          quote: 'USD',
          type: 'option',
          underlyingAssetId: asset.id,
          quoteAssetId: quoteAssetUSD.id,
          meta: { expiry: expiryStr, strike: 150, optionType: 'call' },
        });
        // Put
        instrumentsData.push({
          symbol: `${asset.symbol}_${dateStr}_150_P`,
          base: asset.symbol,
          quote: 'USD',
          type: 'option',
          underlyingAssetId: asset.id,
          quoteAssetId: quoteAssetUSD.id,
          meta: { expiry: expiryStr, strike: 150, optionType: 'put' },
        });
      }
    }
    console.log(`Generated ${instrumentsData.length} instrument definitions.`);

    for (const instData of instrumentsData) {
      console.log(`Processing instrument: ${instData.symbol}`);
      const existing = await prisma.instrument.findFirst({
        where: {
          tenantId,
          symbol: instData.symbol,
        },
      });

      if (existing) {
        console.log(`Instrument ${instData.symbol} already exists.`);
      } else {
        console.log(`Creating instrument ${instData.symbol}...`);
        try {
          await prisma.instrument.create({
            data: {
              tenantId,
              symbol: instData.symbol,
              underlyingAssetId: instData.underlyingAssetId,
              quoteAssetId: instData.quoteAssetId,
              status: 'active',
              type: instData.type,
              meta: instData.meta,
              createdByMembershipId: membershipId,
              updatedByMembershipId: membershipId,
              createdByUserId: userId,
              updatedByUserId: userId,
            },
          });
        } catch (e) {
          console.error(`Failed to create instrument ${instData.symbol}:`, e);
        }
      }
    }
  } else {
    console.error(
      'USD asset not found in assetsMap. Skipping instrument creation.',
    );
  }

  return assetsMap;
}
