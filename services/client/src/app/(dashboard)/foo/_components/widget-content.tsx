import { WidgetType } from './layouts';
import { PriceUpdate } from 'src/proto/market/market';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { ChartDataPoint } from '@/shared/hooks/useMarketChart';
import { WatchlistWidget } from '@/components/widgets/watchlist/WatchlistWidget';
import { PositionsWidget } from '@/components/widgets/positions/PositionsWidget';
import { PortfolioWidget } from '@/components/widgets/portfolio/PortfolioWidget';
import { RecentOrdersWidget } from '@/components/widgets/orders/RecentOrdersWidget';
import { OptionsChainWidget } from '@/components/widgets/options-chain/OptionsChainWidget';

interface WidgetContentProps {
  type: WidgetType;
  initialMarketData?: PriceUpdate;
  initialChartData?: ChartDataPoint[];
}

export const WidgetContent = ({
  type,
  initialChartData,
  initialMarketData,
}: WidgetContentProps) => {
  switch (type) {
    case 'positions':
      return <PositionsWidget />;
    case 'recent_orders':
      return <RecentOrdersWidget />;
    case 'watchlist':
      return <WatchlistWidget />;
    case 'options_chain':
      return <OptionsChainWidget />;
    case 'portfolio':
      return <PortfolioWidget />;
    case 'chart':
      return (
        <ChartWidget
          initialChartData={initialChartData}
          initialMarketData={initialMarketData}
        />
      );
    case 'news':
      return (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          News Feed
        </div>
      );
    case 'orderbook':
      return (
        <div className="flex h-full w-full flex-col p-2 text-xs">
          <div className="flex justify-between font-bold border-b pb-1 mb-1">
            <span>Price</span>
            <span>Size</span>
          </div>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex justify-between py-0.5">
              <span className={i < 10 ? 'text-red-500' : 'text-green-500'}>
                {(100 + (i - 5) * 0.5).toFixed(2)}
              </span>
              <span>{(Math.random() * 10).toFixed(4)}</span>
            </div>
          ))}
        </div>
      );
    default: {
      const label = type as string;
      return (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          {label.charAt(0).toUpperCase() + label.slice(1)} Widget
        </div>
      );
    }
  }
};
