'use server';

import { prisma } from 'src/prisma';
import { matchingEngineClient } from 'src/services/MatchingEngineClient';
import { ledgerClient } from 'src/services/LedgerClient';
import { PlaceOrderRequest } from 'src/proto/matching/engine';
import {
  OrderSide,
  OrderType,
  TimeInForce,
  OrderStatus,
  Order,
} from 'src/proto/common/order';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { appContextForReact } from 'src/shared/controller/appContext';

// --- Types ---

interface OrderInput {
  instrumentId: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: string;
  price?: string;
  timeInForce: string;
}

// --- Main Action ---

export async function placeMatchingEngineOrder(data: OrderInput) {
  const { currentMembership, currentTenant } = await getAuthenticatedContext();
  const account = await ensureAccount(currentMembership.id, currentTenant?.id);
  // getInstrument is still good to ensure it exists locally, but strictly we could rely on ledger.
  // Keeping it doesn't hurt.
  await getInstrument(data.instrumentId);

  // 1. Construct the Order
  const { order } = constructOrderRequest(data, account.id, currentTenant?.id);

  if (!order) {
    throw new Error('Failed to construct order object');
  }

  // 2. Validate & Reserve Funds (Call Ledger Service)
  // This will also forward the order to the Matching Engine if validation succeeds.
  await validateAndReserveFunds(order);

  return {
    success: true,
    orderId: order.id,
  };
}

// --- Helpers ---

async function getAuthenticatedContext() {
  const context = await appContextForReact(cookies());
  if (!context.currentUser || !context.currentMembership) {
    throw new Error('User not authenticated');
  }
  return {
    currentUser: context.currentUser,
    currentMembership: context.currentMembership,
    currentTenant: context.currentTenant,
  };
}

async function ensureAccount(userId: string, tenantId?: string) {
  let account = await prisma.account.findFirst({
    where: { userId, tenantId },
  });

  if (!account) {
    account = await prisma.account.create({
      data: {
        name: 'Default Account',
        type: 'default',
        userId,
        tenantId,
        status: 'active',
      },
    });
  }
  return account;
}

async function getInstrument(instrumentId: string) {
  const instrument = await prisma.instrument.findUnique({
    where: { id: instrumentId },
    include: {
      quoteAsset: true,
      underlyingAsset: true,
    },
  });

  if (!instrument || !instrument.quoteAsset || !instrument.underlyingAsset) {
    throw new Error('Instrument or assets not found');
  }
  return instrument;
}

async function validateAndReserveFunds(order: Order) {
  try {
    // This calls LedgerService.recordOrder which:
    // 1. Validates user has sufficient available balance.
    // 2. Locks the required amount (decrements available, increments locked).
    // 3. Persists the order in the Ledger DB with status 'Open'.
    // If validation fails, it throws an error and nothing is recorded.
    const response = await ledgerClient.recordOrder({ order });

    if (!response.success) {
      throw new Error(response.message || 'Ledger validation failed');
    }
    console.log('Funds reserved in ledger:', response.transactionId);
  } catch (error: any) {
    console.error('Ledger check failed:', error);
    // Propagate error to UI
    throw new Error(error.message || 'Failed to validate order with ledger');
  }
}

function constructOrderRequest(
  data: OrderInput,
  accountId: string,
  tenantId?: string,
): PlaceOrderRequest {
  const orderId = uuidv4();

  let price = data.price;
  if (!price || price === '$undefined' || price === 'undefined') {
    price = '0';
  }

  const order: Order = {
    id: orderId,
    tenantId: tenantId || undefined,
    accountId,
    instrumentId: data.instrumentId,
    side:
      data.side === 'buy'
        ? OrderSide.ORDER_SIDE_BUY
        : OrderSide.ORDER_SIDE_SELL,
    type:
      data.type === 'market'
        ? OrderType.ORDER_TYPE_MARKET
        : OrderType.ORDER_TYPE_LIMIT,
    quantity: data.quantity,
    price,
    quantityFilled: '0',
    timeInForce: mapTimeInForce(data.timeInForce),
    status: OrderStatus.ORDER_STATUS_OPEN,
    createdAt: Date.now().toString(),
    updatedAt: Date.now().toString(),
  };

  return { order };
}

function mapTimeInForce(tif: string): TimeInForce {
  switch (tif) {
    case 'gtc':
      return TimeInForce.TIME_IN_FORCE_GTC;
    case 'ioc':
      return TimeInForce.TIME_IN_FORCE_IOC;
    case 'fok':
      return TimeInForce.TIME_IN_FORCE_FOK;
    default:
      return TimeInForce.TIME_IN_FORCE_GTC;
  }
}
