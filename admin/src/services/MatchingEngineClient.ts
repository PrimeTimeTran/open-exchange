import { credentials } from '@grpc/grpc-js';
import { MatchingEngineClient } from 'src/proto/matching/engine';
import {
  PlaceOrderRequest,
  PlaceOrderResponse,
} from 'src/proto/matching/engine';

console.log('MatchingEngineClient imported:', MatchingEngineClient);

const MATCHING_ENGINE_URL =
  process.env.MATCHING_ENGINE_URL || 'localhost:50051';

// We instantiate the client once.
// In a real app, you might want to handle connection pooling or reconnection strategies.
const client = new MatchingEngineClient(
  MATCHING_ENGINE_URL,
  credentials.createInsecure(),
);

export const matchingEngineClient = {
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
};
