import { credentials } from '@grpc/grpc-js';
import {
  PriceUpdate,
  MarketServiceClient,
  GetLatestPriceRequest,
  GetMarketDataRequest,
  GetMarketDataResponse,
} from 'src/proto/market/market';

const MARKET_SERVICE_URL = process.env.MARKET_SERVICE_URL || 'localhost:50053';

let clientInstance: MarketServiceClient | null = null;

function getClient(): MarketServiceClient {
  if (!clientInstance) {
    console.log(`Connecting to Market Service at: ${MARKET_SERVICE_URL}`);
    clientInstance = new MarketServiceClient(
      MARKET_SERVICE_URL,
      credentials.createInsecure(),
    );
  }
  return clientInstance;
}

export const marketClient = {
  getLatestPrice: async (
    request: GetLatestPriceRequest,
  ): Promise<PriceUpdate> => {
    return new Promise((resolve, reject) => {
      getClient().getLatestPrice(request, (err, response) => {
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
      getClient().getMarketData(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },
};
