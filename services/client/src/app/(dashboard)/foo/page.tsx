import { DynamicDashboard } from './_components/DynamicDashboard';
import { fetchMarketData } from 'src/actions/market';
import { marketClient } from 'src/services/MarketClient';

export const dynamic = 'force-dynamic';

export default async function DynamicLayoutPage() {
  let marketData;
  let chartData;

  const now = Date.now();
  const startTime = now - 7 * 24 * 60 * 60 * 1000;

  try {
    const [priceRes, historyData] = await Promise.all([
      marketClient.getLatestPrice({ symbol: 'BTC_USD' }),
      fetchMarketData('BTC_USD', '1d', startTime, now),
    ]);

    marketData = priceRes;

    chartData = historyData.map((p) => ({
      time: p.time,
      value: p.value,
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
  }

  return (
    <div className="h-full w-full">
      <DynamicDashboard
        initialMarketData={marketData}
        initialChartData={chartData}
      />
    </div>
  );
}
