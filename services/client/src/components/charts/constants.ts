// Helper to generate candle data
const generateCandles = (
  count: number,
  startPrice: number,
  intervalType: 'day' | 'month' | 'year' = 'day',
) => {
  let currentPrice = startPrice;
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const volatility = currentPrice * 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * volatility;
    const close = currentPrice + change;
    const open = currentPrice;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
    const volume = Math.floor(Math.random() * 10000);

    currentPrice = close;

    const offset = count - 1 - i;
    const date = new Date(now);

    if (intervalType === 'month') {
      date.setMonth(date.getMonth() - offset);
    } else if (intervalType === 'year') {
      date.setFullYear(date.getFullYear() - offset);
    } else {
      date.setDate(date.getDate() - offset);
    }

    return {
      time: date.getTime(),
      value: close,
      open,
      high,
      low,
      close,
      volume,
    };
  });
};

// 1D specific mock
const generate1D = () => {
  const points: {
    time: number;
    value: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[] = [];
  let price = 24500;
  const now = new Date();
  now.setHours(9, 30, 0, 0); // Start at 9:30 AM today

  for (let i = 0; i < 20; i++) {
    const volatility = price * 0.005;
    const change = (Math.random() - 0.5) * volatility;
    const close = price + change;
    const open = price;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.2);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.2);

    const time = new Date(now.getTime() + i * 30 * 60000).getTime(); // Add 30 mins per point

    points.push({
      time,
      value: close,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 5000),
    });
    price = close;
  }
  return points;
};

// 1W specific mock (4h candles)
const generate1W = () => {
  const points: {
    time: number;
    value: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[] = [];
  let price = 24000;
  const now = Date.now();
  const totalPoints = 42; // 7 days * 24h / 4h = 42 points
  const interval = 4 * 60 * 60 * 1000; // 4 hours

  for (let i = 0; i < totalPoints; i++) {
    const volatility = price * 0.01;
    const change = (Math.random() - 0.5) * volatility;
    const close = price + change;
    const open = price;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.3);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.3);

    // Calculate time working backwards from now
    const time = now - (totalPoints - 1 - i) * interval;

    points.push({
      time,
      value: close,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 8000),
    });
    price = close;
  }
  return points;
};

export const DATA_RANGES = {
  '1D': generate1D(),
  '1W': generate1W(),
  '1M': generateCandles(30, 23000, 'day'),
  '3M': generateCandles(90, 20000, 'day'),
  YTD: generateCandles(100, 18000, 'day'),
  '1Y': generateCandles(365, 15000, 'day'),
  ALL: generateCandles(50, 5000, 'year'),
};

export const CHART_RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'];
