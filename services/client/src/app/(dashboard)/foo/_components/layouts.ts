export type WidgetType =
  | 'chart'
  | 'orderbook'
  | 'positions'
  | 'watchlist'
  | 'news'
  | 'portfolio'
  | 'options_chain'
  | 'recent_orders';

export interface Widget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: WidgetType;
  title: string;
}

export interface LayoutConfig {
  id: string;
  name: string;
  widgets: Widget[];
}

export const DEFAULT_LAYOUTS: LayoutConfig[] = [
  {
    id: 'options',
    name: 'Options',
    widgets: [
      {
        i: 'portfolio',
        x: 0,
        y: 0,
        w: 3,
        h: 6,
        type: 'portfolio',
        title: 'Portfolio',
      },
      {
        i: 'watchlist',
        x: 0,
        y: 6,
        w: 3,
        h: 6,
        type: 'watchlist',
        title: 'Watchlist',
      },
      {
        i: 'chart',
        x: 3,
        y: 0,
        w: 6,
        h: 6,
        type: 'chart',
        title: 'Chart',
      },
      {
        i: 'options-chain',
        x: 3,
        y: 6,
        w: 6,
        h: 6,
        type: 'options_chain',
        title: 'Options Chain',
      },
      {
        i: 'positions',
        x: 9,
        y: 0,
        w: 3,
        h: 6,
        type: 'positions',
        title: 'Positions',
      },
      {
        i: 'recent-orders',
        x: 9,
        y: 6,
        w: 3,
        h: 6,
        type: 'recent_orders',
        title: 'Recent Orders',
      },
    ],
  },
  {
    id: 'trading',
    name: 'Trading',
    widgets: [
      {
        i: 'chart',
        x: 0,
        y: 0,
        w: 8,
        h: 4,
        type: 'chart',
        title: 'Price Chart',
      },
      {
        i: 'orderbook',
        x: 8,
        y: 0,
        w: 4,
        h: 6,
        type: 'orderbook',
        title: 'Order Book',
      },
      {
        i: 'positions',
        x: 0,
        y: 4,
        w: 8,
        h: 2,
        type: 'positions',
        title: 'Positions',
      },
    ],
  },
  {
    id: 'analysis',
    name: 'Analysis',
    widgets: [
      {
        i: 'chart-main',
        x: 0,
        y: 0,
        w: 12,
        h: 4,
        type: 'chart',
        title: 'Main Chart',
      },
      { i: 'news', x: 0, y: 4, w: 6, h: 3, type: 'news', title: 'News Feed' },
      {
        i: 'watchlist',
        x: 6,
        y: 4,
        w: 6,
        h: 3,
        type: 'watchlist',
        title: 'Watchlist',
      },
    ],
  },
];
