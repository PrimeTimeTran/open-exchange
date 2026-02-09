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

export async function placeMatchingEngineOrder(data: {
  instrumentId: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: string;
  price?: string;
  timeInForce: string;
}) {
  console.log('placeMatchingEngineOrder', data);
  const context = await appContextForReact(cookies());
  const currentUser = context.currentUser;
  const currentMembership = context.currentMembership;
  const currentTenant = context.currentTenant;

  if (!currentUser || !currentMembership) {
    throw new Error('User not authenticated');
  }

  // Find account for current membership
  let account = await prisma.account.findFirst({
    where: {
      userId: currentMembership.id,
      tenantId: currentTenant?.id,
    },
  });

  if (!account) {
    // Create a default account if none exists
    account = await prisma.account.create({
      data: {
        name: 'Default Account',
        type: 'default',
        userId: currentMembership.id,
        tenantId: currentTenant?.id,
        status: 'active',
      },
    });
  }

  // Fetch instrument details to know base/quote assets
  const instrument = await prisma.instrument.findUnique({
    where: { id: data.instrumentId },
    include: {
      quoteAsset: true,
      underlyingAsset: true,
    },
  });

  if (!instrument || !instrument.quoteAsset || !instrument.underlyingAsset) {
    throw new Error('Instrument or assets not found');
  }

  // Pre-check balance using Ledger Service
  try {
    const walletResponse = await ledgerClient.listWallets({
      accountId: account.id,
    });

    if (data.side === 'buy' && data.type === 'limit' && data.price) {
      // Check Quote Asset (e.g. USD) balance
      const requiredAmount = Number(data.price) * Number(data.quantity);
      const quoteWallet = walletResponse.wallets?.find(
        (w) => w.assetId === instrument.quoteAsset!.id,
      );
      const availableBalance = Number(quoteWallet?.available || 0);

      if (availableBalance < requiredAmount) {
        throw new Error(
          `Insufficient ${instrument.quoteAsset.symbol} balance. Required: ${requiredAmount}, Available: ${availableBalance}`,
        );
      }
    } else if (data.side === 'sell') {
      // Check Base Asset (e.g. BTC) balance
      const requiredAmount = Number(data.quantity);
      const baseWallet = walletResponse.wallets?.find(
        (w) => w.assetId === instrument.underlyingAsset!.id,
      );
      const availableBalance = Number(baseWallet?.available || 0);

      if (availableBalance < requiredAmount) {
        throw new Error(
          `Insufficient ${instrument.underlyingAsset.symbol} balance. Required: ${requiredAmount}, Available: ${availableBalance}`,
        );
      }
    }
  } catch (error: any) {
    console.error('Ledger check failed:', error);
    // Don't block if ledger service is down or error is strictly network related,
    // unless you want strict enforcement.
    // For now, re-throwing if it's our "Insufficient balance" error.
    if (error.message.includes('Insufficient')) {
      throw error;
    }
    // Otherwise, we might log and proceed, letting Matching Engine be final arbiter.
    // But usually you want to fail here if you can't verify.
    // throw error;
  }

  const orderId = uuidv4();

  let price = data.price;
  if (!price || price === '$undefined' || price === 'undefined') {
    price = '0';
  }

  const order: Order = {
    id: orderId,
    tenantId: currentTenant?.id || undefined,
    accountId: account.id,
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

  const request: PlaceOrderRequest = {
    order,
  };

  try {
    const response = await matchingEngineClient.placeOrder(request);
    console.log('placeOrder response', response);

    if (!response.success) {
      throw new Error(
        response.errorMessage || 'Unknown error from matching engine',
      );
    }

    return {
      success: true,
      orderId: response.orderId,
    };
  } catch (error: any) {
    console.error('placeOrder error', error);
    throw new Error(error.message || 'Failed to place order');
  }
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
