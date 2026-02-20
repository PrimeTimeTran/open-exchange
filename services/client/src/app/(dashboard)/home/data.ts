import { DATA_RANGES } from '@/components/charts/constants';

export { DATA_RANGES };

export const LISTS = {
  // Stocks: [
  //   {
  //     symbol: 'AAPL',
  //     price: '185.90',
  //     change: '+0.4%',
  //     up: true,
  //     name: 'Apple',
  //   },
  //   {
  //     symbol: 'TSLA',
  //     price: '215.30',
  //     change: '-1.2%',
  //     up: false,
  //     name: 'Tesla',
  //   },
  //   {
  //     symbol: 'NVDA',
  //     price: '540.20',
  //     change: '+3.5%',
  //     up: true,
  //     name: 'Nvidia',
  //   },
  //   {
  //     symbol: 'MSFT',
  //     price: '390.10',
  //     change: '+0.8%',
  //     up: true,
  //     name: 'Microsoft',
  //   },
  // ],
  // Options: [
  //   {
  //     symbol: 'SPY 480C',
  //     price: '2.45',
  //     change: '+15%',
  //     up: true,
  //     name: 'Jan 19 Call',
  //   },
  //   {
  //     symbol: 'TSLA 200P',
  //     price: '5.20',
  //     change: '+8.4%',
  //     up: true,
  //     name: 'Feb 16 Put',
  //   },
  //   {
  //     symbol: 'AMD 160C',
  //     price: '3.10',
  //     change: '-12%',
  //     up: false,
  //     name: 'Mar 15 Call',
  //   },
  // ],
  // Futures: [
  //   {
  //     symbol: 'ES_F',
  //     price: '4805.25',
  //     change: '+0.2%',
  //     up: true,
  //     name: 'S&P 500 E-Mini',
  //   },
  //   {
  //     symbol: 'NQ_F',
  //     price: '16950.50',
  //     change: '-0.1%',
  //     up: false,
  //     name: 'Nasdaq 100 E-Mini',
  //   },
  //   {
  //     symbol: 'CL_F',
  //     price: '72.40',
  //     change: '+1.5%',
  //     up: true,
  //     name: 'Crude Oil',
  //   },
  // ],
  Crypto: [
    {
      symbol: 'OPENC',
      price: '43,240.50',
      change: '+2.4%',
      up: true,
      name: 'Open Exchange Coin',
    },
    {
      symbol: 'BTC',
      price: '43,240.50',
      change: '+2.4%',
      up: true,
      name: 'Bitcoin',
    },
    {
      symbol: 'ETH',
      price: '2,310.20',
      change: '+1.8%',
      up: true,
      name: 'Ethereum',
    },
    {
      symbol: 'SOL',
      price: '98.45',
      change: '-0.5%',
      up: false,
      name: 'Solana',
    },
  ],
};

export const WATCHLIST = [
  ...LISTS.Crypto.slice(0, 3),
  // ...LISTS.Stocks.slice(0, 2),
];
