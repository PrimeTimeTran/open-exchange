import { WidgetType } from './layouts';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { PriceUpdate } from 'src/proto/market/market';
import { ChartDataPoint } from '@/shared/hooks/useMarketChart';

interface WidgetContentProps {
  type: WidgetType;
  initialMarketData?: PriceUpdate;
  initialChartData?: ChartDataPoint[];
}

export const WidgetContent = ({
  type,
  initialMarketData,
  initialChartData,
}: WidgetContentProps) => {
  switch (type) {
    case 'chart':
      return (
        <ChartWidget
          initialMarketData={initialMarketData}
          initialChartData={initialChartData}
        />
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
    case 'positions':
      return (
        <div className="flex h-full w-full items-center justify-center bg-background/50 text-muted-foreground">
          No open positions
        </div>
      );
    case 'watchlist':
      return (
        <div className="flex h-full w-full flex-col p-2 text-xs">
          <div className="font-bold border-b pb-1 mb-1">Symbol</div>
          {['BTC-USD', 'ETH-USD', 'SOL-USD'].map((s) => (
            <div key={s} className="py-1 flex justify-between">
              <span>{s}</span>
              <span className="text-green-500">+2.4%</span>
            </div>
          ))}
        </div>
      );
    case 'portfolio':
      return (
        <div className="flex h-full w-full items-center justify-center bg-background/50 text-muted-foreground">
          Portfolio Overview
        </div>
      );
    case 'options_chain':
      return (
        <div className="flex h-full w-full items-center justify-center bg-background/50 text-muted-foreground">
          Options Chain
        </div>
      );
    case 'recent_orders':
      return (
        <div className="flex h-full w-full items-center justify-center bg-background/50 text-muted-foreground">
          Recent Orders
        </div>
      );
    case 'news':
      return (
        <div className="flex h-full w-full items-center justify-center bg-background/50 text-muted-foreground">
          News Feed
        </div>
      );
    default:
      return (
        <div className="flex h-full w-full items-center justify-center bg-background/50 text-muted-foreground">
          {type.charAt(0).toUpperCase() + type.slice(1)} Widget
        </div>
      );
  }
};
