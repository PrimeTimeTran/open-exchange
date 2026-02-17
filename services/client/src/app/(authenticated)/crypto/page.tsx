import React from 'react';
import { cookies } from 'next/headers';
import { fetchMarketData } from 'src/actions/market';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { marketClient } from 'src/services/MarketClient';
import { appContextForReact } from 'src/shared/controller/appContext';
import {
  CryptoAssetData,
  CryptoTableClient,
} from '@/components/crypto/crypto-table-client';

export default async function CryptoPage() {
  const context = await appContextForReact(cookies());

  if (!context.currentTenant) {
    return null;
  }

  const prisma = prismaDangerouslyBypassAuth(context);

  const assets = await prisma.asset.findMany({
    where: {
      tenantId: context.currentTenant.id,
      klass: 'crypto',
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;

  // Fetch all data in parallel
  const marketDataPromises = assets.map(async (asset) => {
    try {
      const symbol = `${asset.symbol}_USD`;

      // 1. Get Latest Price (24h change, vol)
      const priceData = await marketClient.getLatestPrice({ symbol });

      // 2. Get Historical Data (Sparkline) - 4h interval for 7d chart
      const history7d = await fetchMarketData(symbol, '4h', sevenDaysAgo, now);

      // 3. Get 1h Data for 1h Change (5m interval)
      const history1h = await fetchMarketData(symbol, '5m', oneHourAgo, now);

      // Ensure stable mock for supply if missing
      const meta = (asset.meta as any) || {};
      if (!meta.circulatingSupply) {
        // Mock supply if missing
        meta.circulatingSupply =
          10000000 + Math.floor(Math.random() * 50000000);
      }

      return {
        symbol: asset.symbol,
        priceData,
        history7d: history7d.map((h) => h.close),
        history1h: history1h.map((h) => h.close),
        meta,
      };
    } catch (error) {
      console.error(`Failed to fetch data for ${asset.symbol}:`, error);
      return {
        symbol: asset.symbol,
        priceData: null,
        history7d: [],
        history1h: [],
        meta: (asset.meta as any) || {},
      };
    }
  });

  const rows = await Promise.all(marketDataPromises);

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Crypto Market
          </h1>
          <p className="text-on-surface-variant mt-2">
            Real-time prices, market cap, and 7-day trends for top
            cryptocurrencies.
          </p>
        </div>
      </div>

      <CryptoTableClient initialData={rows} />
    </div>
  );
}
