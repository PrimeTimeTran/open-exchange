import { PrismaClient } from '@prisma/client';

export async function seedAssets(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
) {
  const assetsData = [
    { symbol: 'USD', name: 'US Dollar', klass: 'fiat', decimals: 2 },
    // Cryptos
    { symbol: 'BTC', name: 'Bitcoin', klass: 'crypto', decimals: 8 },
    { symbol: 'ETH', name: 'Ethereum', klass: 'crypto', decimals: 18 },
    { symbol: 'USDT', name: 'Tether', klass: 'crypto', decimals: 6 },
    { symbol: 'BNB', name: 'BNB', klass: 'crypto', decimals: 18 },
    { symbol: 'SOL', name: 'Solana', klass: 'crypto', decimals: 9 },
    { symbol: 'XRP', name: 'XRP', klass: 'crypto', decimals: 6 },
    { symbol: 'USDC', name: 'USDC', klass: 'crypto', decimals: 6 },
    { symbol: 'ADA', name: 'Cardano', klass: 'crypto', decimals: 6 },
    { symbol: 'AVAX', name: 'Avalanche', klass: 'crypto', decimals: 18 },
    { symbol: 'DOGE', name: 'Dogecoin', klass: 'crypto', decimals: 8 },
    { symbol: 'OPENC', name: 'Open Coin', klass: 'crypto', decimals: 18 },
    // Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', klass: 'stock', decimals: 2 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', klass: 'stock', decimals: 2 },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'TSLA', name: 'Tesla Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'BRK.B',
      name: 'Berkshire Hathaway Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'LLY', name: 'Eli Lilly and Co.', klass: 'stock', decimals: 2 },
    { symbol: 'V', name: 'Visa Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'AVGO', name: 'Broadcom Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'UNH',
      name: 'UnitedHealth Group Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'WMT', name: 'Walmart Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'MA', name: 'Mastercard Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', klass: 'stock', decimals: 2 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', klass: 'stock', decimals: 2 },
    { symbol: 'PG', name: 'Procter & Gamble Co.', klass: 'stock', decimals: 2 },
    { symbol: 'HD', name: 'Home Depot Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'COST',
      name: 'Costco Wholesale Corp.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'MRK', name: 'Merck & Co. Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'ORCL', name: 'Oracle Corp.', klass: 'stock', decimals: 2 },
    { symbol: 'ABBV', name: 'AbbVie Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'CVX', name: 'Chevron Corp.', klass: 'stock', decimals: 2 },
    {
      symbol: 'BAC',
      name: 'Bank of America Corp.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'ADBE', name: 'Adobe Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'CRM', name: 'Salesforce Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'KO', name: 'Coca-Cola Co.', klass: 'stock', decimals: 2 },
    {
      symbol: 'AMD',
      name: 'Advanced Micro Devices Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'PEP', name: 'PepsiCo Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'TMO',
      name: 'Thermo Fisher Scientific Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'NFLX', name: 'Netflix Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'MCD', name: "McDonald's Corp.", klass: 'stock', decimals: 2 },
    { symbol: 'LIN', name: 'Linde plc', klass: 'stock', decimals: 2 },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'WFC', name: 'Wells Fargo & Co.', klass: 'stock', decimals: 2 },
    { symbol: 'ACN', name: 'Accenture plc', klass: 'stock', decimals: 2 },
    { symbol: 'ABT', name: 'Abbott Laboratories', klass: 'stock', decimals: 2 },
    { symbol: 'DHR', name: 'Danaher Corp.', klass: 'stock', decimals: 2 },
    { symbol: 'INTU', name: 'Intuit Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'DIS', name: 'Walt Disney Co.', klass: 'stock', decimals: 2 },
    { symbol: 'NKE', name: 'NIKE Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'PM',
      name: 'Philip Morris International Inc.',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'VZ',
      name: 'Verizon Communications Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'PFE', name: 'Pfizer Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'IBM',
      name: 'International Business Machines Corp.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'QCOM', name: 'Qualcomm Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'NEE', name: 'NextEra Energy Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'UNP', name: 'Union Pacific Corp.', klass: 'stock', decimals: 2 },
    {
      symbol: 'TXN',
      name: 'Texas Instruments Inc.',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'BMY',
      name: 'Bristol-Myers Squibb Co.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'CMCSA', name: 'Comcast Corp.', klass: 'stock', decimals: 2 },
    { symbol: 'AMGN', name: 'Amgen Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'UPS',
      name: 'United Parcel Service Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'GE', name: 'General Electric Co.', klass: 'stock', decimals: 2 },
    {
      symbol: 'LOW',
      name: "Lowe's Companies Inc.",
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'CAT', name: 'Caterpillar Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'AMAT',
      name: 'Applied Materials Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'BA', name: 'Boeing Co.', klass: 'stock', decimals: 2 },
    {
      symbol: 'HON',
      name: 'Honeywell International Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'RTX', name: 'RTX Corp.', klass: 'stock', decimals: 2 },
    {
      symbol: 'UBER',
      name: 'Uber Technologies Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'SPGI', name: 'S&P Global Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'COP', name: 'ConocoPhillips', klass: 'stock', decimals: 2 },
    { symbol: 'MS', name: 'Morgan Stanley', klass: 'stock', decimals: 2 },
    { symbol: 'PLD', name: 'Prologis Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'GS',
      name: 'Goldman Sachs Group Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'CVS', name: 'CVS Health Corp.', klass: 'stock', decimals: 2 },
    { symbol: 'DE', name: 'Deere & Co.', klass: 'stock', decimals: 2 },
    {
      symbol: 'ISRG',
      name: 'Intuitive Surgical Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'T', name: 'AT&T Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'SYK', name: 'Stryker Corp.', klass: 'stock', decimals: 2 },
    { symbol: 'BLK', name: 'BlackRock Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'ELV',
      name: 'Elevance Health Inc.',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'GILD',
      name: 'Gilead Sciences Inc.',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'LMT',
      name: 'Lockheed Martin Corp.',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'BKNG',
      name: 'Booking Holdings Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'MDT', name: 'Medtronic plc', klass: 'stock', decimals: 2 },
    { symbol: 'TJX', name: 'TJX Companies Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'ADI', name: 'Analog Devices Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'MMC',
      name: 'Marsh & McLennan Companies',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'VRTX',
      name: 'Vertex Pharmaceuticals Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'C', name: 'Citigroup Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'ADP',
      name: 'Automatic Data Processing Inc.',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'SCHW',
      name: 'Charles Schwab Corp.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'ZTS', name: 'Zoetis Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'CB', name: 'Chubb Ltd.', klass: 'stock', decimals: 2 },
    {
      symbol: 'REGN',
      name: 'Regeneron Pharmaceuticals Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'CI', name: 'The Cigna Group', klass: 'stock', decimals: 2 },
    { symbol: 'MO', name: 'Altria Group Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'SO', name: 'Southern Co.', klass: 'stock', decimals: 2 },
    {
      symbol: 'BSX',
      name: 'Boston Scientific Corp.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'EOG', name: 'EOG Resources Inc.', klass: 'stock', decimals: 2 },
    { symbol: 'KLAC', name: 'KLA Corp.', klass: 'stock', decimals: 2 },
    {
      symbol: 'PANW',
      name: 'Palo Alto Networks Inc.',
      klass: 'stock',
      decimals: 2,
    },
    { symbol: 'FI', name: 'Fiserv Inc.', klass: 'stock', decimals: 2 },
    {
      symbol: 'MU',
      name: 'Micron Technology Inc.',
      klass: 'stock',
      decimals: 2,
    },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      klass: 'etf',
      decimals: 2,
    },
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
  const quoteAsset = assetsMap.get('USD');

  console.log('Quote Asset found:', !!quoteAsset);

  if (quoteAsset) {
    console.log('Iterating assets to generate instruments...');
    const allAssets = Array.from(assetsMap.values());
    console.log(`Found ${allAssets.length} assets from map values.`);

    for (const asset of allAssets) {
      console.log(`Checking asset: ${asset.symbol} (ID: ${asset.id})`);
      if (asset.symbol === 'USD') continue;

      // Create Spot Instrument for all assets
      instrumentsData.push({
        symbol: `${asset.symbol}_USD`,
        base: asset.symbol,
        quote: 'USD',
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
          quoteAssetId: quoteAsset.id,
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
          quoteAssetId: quoteAsset.id,
          meta: { expiry: expiryStr, strike: 150, optionType: 'call' },
        });
        // Put
        instrumentsData.push({
          symbol: `${asset.symbol}_${dateStr}_150_P`,
          base: asset.symbol,
          quote: 'USD',
          type: 'option',
          underlyingAssetId: asset.id,
          quoteAssetId: quoteAsset.id,
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
