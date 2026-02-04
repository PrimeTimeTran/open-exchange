export const orderEnumerators = {
  side: {
    buy: 'buy',
    sell: 'sell',
  },

  type: {
    limit: 'limit',
    market: 'market',
    stop_market: 'stop_market',
    stop_limit: 'stop_limit',
    trailing_stop_market: 'trailing_stop_market',
    trailing_stop_limit: 'trailing_stop_limit',
  },

  status: {
    open: 'open',
    partially_filled: 'partially_filled',
    filled: 'filled',
    cancelled: 'cancelled',
  },

  timeInFore: {
    gtc: 'gtc',
    ioc: 'ioc',
    fok: 'fok',
    day: 'day',
  },
};
