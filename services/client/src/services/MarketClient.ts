import { credentials } from '@grpc/grpc-js';
import {
  PriceUpdate,
  MarketServiceClient,
  GetLatestPriceRequest,
  GetMarketDataRequest,
  GetMarketDataResponse,
} from 'src/proto/market/market';

const MARKET_SERVICE_URL = process.env.MARKET_SERVICE_URL || 'localhost:50053';

console.log(`Connecting to Market Service at: ${MARKET_SERVICE_URL}`);

const client = new MarketServiceClient(
  MARKET_SERVICE_URL,
  credentials.createInsecure(),
);

export const marketClient = {
  getLatestPrice: async (
    request: GetLatestPriceRequest,
  ): Promise<PriceUpdate> => {
    return new Promise((resolve, reject) => {
      client.getLatestPrice(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  getMarketData: async (
    request: GetMarketDataRequest,
  ): Promise<GetMarketDataResponse> => {
    return new Promise((resolve, reject) => {
      client.getMarketData(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },
};
