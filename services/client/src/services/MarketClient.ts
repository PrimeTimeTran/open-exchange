import {
  PriceUpdate,
  MarketServiceClient,
  GetLatestPriceRequest,
  GetMarketDataRequest,
  GetMarketDataResponse,
} from 'src/proto/market/market';
import { promisify } from './grpc-helpers';
import { createLazyClient } from './lazy-client';

const MARKET_SERVICE_URL = process.env.MARKET_SERVICE_URL || 'localhost:50053';

const getClient = createLazyClient(
  MarketServiceClient,
  MARKET_SERVICE_URL,
  'Market Service',
);

export const marketClient = {
  getLatestPrice: (request: GetLatestPriceRequest): Promise<PriceUpdate> =>
    promisify(getClient().getLatestPrice.bind(getClient()), request),

  getMarketData: (
    request: GetMarketDataRequest,
  ): Promise<GetMarketDataResponse> =>
    promisify(getClient().getMarketData.bind(getClient()), request),
};
