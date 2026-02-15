export const SYSTEM_ACCOUNTS = [
  {
    name: 'btc_hot_wallet',
    asset: 'BTC',
    type: 'custody',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  },
  {
    name: 'eth_hot_wallet',
    asset: 'ETH',
    type: 'custody',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  },
  {
    name: 'sol_hot_wallet',
    asset: 'SOL',
    type: 'custody',
    address: 'H8sMJqL78hJk2yH8j8m7yH8j8m7yH8j8m7yH8j8m7y',
  },
  {
    name: 'usdt_eth_hot_wallet',
    asset: 'USDT',
    network: 'ETH',
    type: 'custody',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  }, // ERC-20
  {
    name: 'usdt_tron_hot_wallet',
    asset: 'USDT',
    network: 'TRON',
    type: 'custody',
    address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
  }, // TRC-20
  {
    name: 'usdt_sol_hot_wallet',
    asset: 'USDT',
    network: 'SOL',
    type: 'custody',
    address: 'H8sMJqL78hJk2yH8j8m7yH8j8m7yH8j8m7yH8j8m7y',
  }, // SPL

  {
    name: 'openc_reserve',
    asset: 'OPENC',
    type: 'cash',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  },
  { name: 'usd_operational', asset: 'USD', type: 'cash' },
  { name: 'fees_account', asset: 'USD', type: 'fees' },
  { name: 'clearing_account', asset: 'USD', type: 'clearing' },
];
