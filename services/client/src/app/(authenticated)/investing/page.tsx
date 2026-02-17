import React from 'react';
import { cookies } from 'next/headers';
import { appContextForReact } from 'src/shared/controller/appContext';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { marketClient } from 'src/services/MarketClient';
import { PieChart } from '@/components/charts/pie-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function InvestingPage() {
  const context = await appContextForReact(cookies());

  if (!context.currentMembership || !context.currentTenant) {
    return null;
  }

  const prisma = prismaDangerouslyBypassAuth(context);
  const tenantId = context.currentTenant.id;
  const membershipId = context.currentMembership.id;

  const wallets = await prisma.wallet.findMany({
    where: {
      tenantId,
      userId: membershipId,
      account: {
        isSystem: false,
      },
      total: { gt: 0 },
    },
    include: {
      asset: true,
    },
  });

  const portfolioItems = await Promise.all(
    wallets.map(async (w) => {
      const decimals = w.asset?.decimals || 0;
      const amount = Number(w.available || 0) / Math.pow(10, decimals);
      const symbol = w.asset?.symbol || 'USD';
      const klass = w.asset?.klass || 'other';

      let price = 1;

      // Force stablecoins to $1.00 to avoid Market Service data issues
      if (['USDT', 'USDC', 'DAI'].includes(symbol)) {
        price = 1.0;
      }
      // If it's a crypto asset (and not USD/stablecoin), fetch real price
      else if (klass === 'crypto' && symbol !== 'USD') {
        try {
          const priceData = await marketClient.getLatestPrice({
            symbol: `${symbol}_USD`,
          });
          price = parseFloat(priceData.price || '0');
          console.log(
            `[Investing] Fetched price for ${symbol}: ${price} (${priceData.price})`,
          );
        } catch (e) {
          console.warn(`Failed to fetch price for ${symbol}`, e);
          // If price fetch fails, keep price as 0 or fallback if needed
          price = 0;
        }
      }

      return {
        symbol,
        name: (w.asset?.meta as any)?.name || symbol,
        klass,
        amount,
        price,
        value: amount * price,
      };
    }),
  );

  // 3. Group by Asset Class
  const cryptoAssets = portfolioItems
    .filter((i) => i.klass === 'crypto')
    .sort((a, b) => b.value - a.value);

  const fiatAssets = portfolioItems
    .filter((i) => i.klass !== 'crypto')
    .sort((a, b) => b.value - a.value);

  // 4. Prepare Chart Data
  const cryptoChartData = cryptoAssets.map((item, index) => ({
    name: item.symbol,
    value: item.value,
    color: COLORS[index % COLORS.length],
  }));

  const fiatChartData = fiatAssets.map((item, index) => ({
    name: item.symbol,
    value: item.value,
    color: COLORS[index % COLORS.length], // Reuse colors or define distinct palette
  }));

  const totalCryptoValue = cryptoAssets.reduce((acc, i) => acc + i.value, 0);
  const totalFiatValue = fiatAssets.reduce((acc, i) => acc + i.value, 0);
  const totalPortfolioValue = totalCryptoValue + totalFiatValue;

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">
          Investing
        </h1>
        <p className="text-on-surface-variant mt-1">
          Total Portfolio Value:{' '}
          <span className="text-primary font-bold">
            {formatCurrency(totalPortfolioValue)}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Crypto Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Crypto Assets</span>
              <span className="text-xl font-bold">
                {formatCurrency(totalCryptoValue)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-75">
            {cryptoChartData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="shrink-0">
                  <PieChart data={cryptoChartData} size={200} />
                </div>
                <div className="flex-1 w-full space-y-3">
                  {cryptoAssets.map((asset, index) => (
                    <div
                      key={asset.symbol}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-muted-foreground">
                          ({asset.symbol})
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(asset.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 4,
                          })}{' '}
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                No crypto assets found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fiat Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Cash & Fiat</span>
              <span className="text-xl font-bold">
                {formatCurrency(totalFiatValue)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-75">
            {fiatChartData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="shrink-0">
                  <PieChart data={fiatChartData} size={200} />
                </div>
                <div className="flex-1 w-full space-y-3">
                  {fiatAssets.map((asset, index) => (
                    <div
                      key={asset.symbol}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-muted-foreground">
                          ({asset.symbol})
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(asset.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asset.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{' '}
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No fiat assets found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
