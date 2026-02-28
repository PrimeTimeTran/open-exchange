import { MatchingClient } from 'src/proto/matching/engine';
import {
  PlaceOrderRequest,
  PlaceOrderResponse,
  GetOrderBookRequest,
  GetOrderBookResponse,
} from 'src/proto/matching/engine';
import { promisify } from './grpc-helpers';
import { createLazyClient } from './lazy-client';

const MATCHING_ENGINE_URL =
  process.env.MATCHING_ENGINE_URL || 'localhost:50051';

const getClient = createLazyClient(
  MatchingClient,
  MATCHING_ENGINE_URL,
  'Matching Engine',
);

export const matchingClient = {
  placeOrder: (request: PlaceOrderRequest): Promise<PlaceOrderResponse> =>
    promisify(getClient().placeOrder.bind(getClient()), request),

  getOrderBook: (request: GetOrderBookRequest): Promise<GetOrderBookResponse> =>
    promisify(getClient().getOrderBook.bind(getClient()), request),
};
