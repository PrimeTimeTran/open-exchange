import { credentials } from '@grpc/grpc-js';
import { MatchingClient } from 'src/proto/matching/engine';
import {
  PlaceOrderRequest,
  PlaceOrderResponse,
  GetOrderBookRequest,
  GetOrderBookResponse,
} from 'src/proto/matching/engine';

const MATCHING_ENGINE_URL =
  process.env.MATCHING_ENGINE_URL || 'localhost:50051';

console.log('MatchingClient: Connecting to', MATCHING_ENGINE_URL);

// We instantiate the client once.
// In a real app, you might want to handle connection pooling or reconnection strategies.
const client = new MatchingClient(
  MATCHING_ENGINE_URL,
  credentials.createInsecure(),
);

export const matchingClient = {
  placeOrder: async (
    request: PlaceOrderRequest,
  ): Promise<PlaceOrderResponse> => {
    return new Promise((resolve, reject) => {
      client.placeOrder(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },

  getOrderBook: async (
    request: GetOrderBookRequest,
  ): Promise<GetOrderBookResponse> => {
    return new Promise((resolve, reject) => {
      client.getOrderBook(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  },
};
