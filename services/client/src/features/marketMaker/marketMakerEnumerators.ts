export const marketMakerEnumerators = {
  status: {
    active: 'active',
    inactive: 'inactive',
    suspended: 'suspended',
  },

  tier: {
    standard: 'standard',
    premium: 'premium',
    institutional: 'institutional',
  },

  specialOrderTypes: {
    LIMIT: 'LIMIT',
    MARKET: 'MARKET',
    IOC: 'IOC',
    FOK: 'FOK',
    GTC: 'GTC',
    GTD: 'GTD',
    DAY: 'DAY',
    STOP: 'STOP',
    STOP_LIMIT: 'STOP_LIMIT',
    TRAILING_STOP: 'TRAILING_STOP',
    TRAILING_STOP_LIMIT: 'TRAILING_STOP_LIMIT',
    ICEBERG: 'ICEBERG',
    TWAP: 'TWAP',
    VWAP: 'VWAP',
    POV: 'POV',
    BLOCK: 'BLOCK',
    QUOTE: 'QUOTE',
    LIQUIDITY_PROVISION: 'LIQUIDITY_PROVISION',
    PEGGED: 'PEGGED',
    MATCHING_ENGINE_DIRECT: 'MATCHING_ENGINE_DIRECT',
    RFQ_RESPONSE: 'RFQ_RESPONSE',
    CONDITIONAL_CANCEL: 'CONDITIONAL_CANCEL',
  },
};
