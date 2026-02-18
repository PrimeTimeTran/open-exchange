import { useState, useEffect } from 'react';
import { fetchMarketData } from 'src/actions/market';
import { PriceUpdate } from 'src/proto/market/market';
import { DATA_RANGES } from '@/components/charts/constants';

export interface ChartDataPoint {
  time: number | string;
  value: number;
}

interface UseMarketChartProps {
  symbol: string;
  initialMarketData?: PriceUpdate;
  initialChartData?: ChartDataPoint[];
}

export function useMarketChart({
  symbol,
  initialMarketData,
  initialChartData,
}: UseMarketChartProps) {
  const [timeRange, setTimeRange] = useState<string>('1W');
  const [chartData, setChartData] = useState<ChartDataPoint[]>(
    initialChartData || [],
  );
  const [loading, setLoading] = useState(false);
  const [hoveredData, setHoveredData] = useState<ChartDataPoint | null>(null);

  useEffect(() => {
    // If we have no initial data, fall back to mock for 1M or whatever default
    if (!initialChartData || initialChartData.length === 0) {
      // DATA_RANGES values are mock objects with string times.
      // This is just a safe fallback if SSR failed completely.
      setChartData(DATA_RANGES['1W']);
    } else {
      setChartData(initialChartData);
    }
  }, [initialChartData]);

  const handleRangeChange = async (range: string) => {
    setTimeRange(range);
    setLoading(true);

    try {
      const now = Date.now();
      let startTime = now;
      let interval = '1d';

      // Map range to API params
      switch (range) {
        case '1D':
          startTime = now - 24 * 60 * 60 * 1000;
          interval = '1h';
          break;
        case '1W':
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          interval = '4h';
          break;
        case '1M':
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          interval = '1d';
          break;
        case '3M':
          startTime = now - 90 * 24 * 60 * 60 * 1000;
          interval = '3d';
          break;
        case 'YTD':
          const startOfYear = new Date(
            new Date().getFullYear(),
            0,
            1,
          ).getTime();
          startTime = startOfYear;
          interval = '1d';
          break;
        case '1Y':
          startTime = now - 365 * 24 * 60 * 60 * 1000;
          interval = '1d';
          break;
        case 'ALL':
          startTime = now - 5 * 365 * 24 * 60 * 60 * 1000;
          interval = '1w';
          break;
      }

      // Ensure symbol is formatted correctly for API
      const apiSymbol = symbol.includes('_') ? symbol : `${symbol}_USD`;

      const data = await fetchMarketData(apiSymbol, interval, startTime, now);

      if (data.length > 0) {
        setChartData(
          data.map((d) => ({
            time: d.time,
            value: d.value,
          })),
        );
      } else {
        console.warn('No data from API, using mock fallback');
        // Fallback to mock data if key exists in DATA_RANGES
        if (range in DATA_RANGES) {
          setChartData(DATA_RANGES[range as keyof typeof DATA_RANGES]);
        } else {
          setChartData([]);
        }
      }
    } catch (err) {
      console.error(err);
      if (range in DATA_RANGES) {
        setChartData(DATA_RANGES[range as keyof typeof DATA_RANGES]);
      } else {
        setChartData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPositive =
    chartData.length > 0
      ? chartData[chartData.length - 1].value >= chartData[0].value
      : true;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  // Calculate display values
  let displayPrice = '$0.00';
  let displayChange = '$0.00';
  let displayPercentChange = '0.00%';
  let isDisplayPositive = true;

  if (hoveredData && chartData.length > 0) {
    const startValue = chartData[0].value;
    const currentValue = hoveredData.value;
    const changeValue = currentValue - startValue;
    const percentChangeValue = (changeValue / startValue) * 100;

    displayPrice = `$${currentValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    displayChange = `$${Math.abs(changeValue).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    displayPercentChange = `${Math.abs(percentChangeValue).toFixed(2)}%`;
    isDisplayPositive = changeValue >= 0;
  } else if (chartData.length > 0) {
    const startValue = chartData[0].value;
    const currentValue = chartData[chartData.length - 1].value;
    const changeValue = currentValue - startValue;
    const percentChangeValue = (changeValue / startValue) * 100;

    displayPrice = `$${currentValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    displayChange = `$${Math.abs(changeValue).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    displayPercentChange = `${Math.abs(percentChangeValue).toFixed(2)}%`;
    isDisplayPositive = changeValue >= 0;
  } else {
    // Fallback if no chart data
    displayPrice = initialMarketData?.price
      ? `$${parseFloat(initialMarketData.price).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '$0.00';

    displayChange = initialMarketData?.change24h
      ? `$${Math.abs(initialMarketData.change24h).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '$0.00';

    displayPercentChange =
      initialMarketData?.change24h && initialMarketData.price
        ? `${Math.abs(
            (initialMarketData.change24h /
              (parseFloat(initialMarketData.price) -
                initialMarketData.change24h)) *
              100,
          ).toFixed(2)}%`
        : '0.00%';

    isDisplayPositive = initialMarketData?.change24h
      ? initialMarketData.change24h >= 0
      : isPositive;
  }

  return {
    loading,
    lineColor,
    timeRange,
    chartData,
    hoveredData,
    displayPrice,
    displayChange,
    setHoveredData,
    handleRangeChange,
    isDisplayPositive,
    displayPercentChange,
  };
}
