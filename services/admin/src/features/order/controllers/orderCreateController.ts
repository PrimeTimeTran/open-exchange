import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { orderCreateInputSchema } from 'src/features/order/orderSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';
import { matchingEngineClient } from 'src/services/MatchingEngineClient';
import {
  OrderSide,
  OrderType,
  OrderStatus,
  TimeInForce,
} from 'src/proto/common/order';

export const orderCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/order',
  request: {
    body: {
      content: {
        'application/json': {
          schema: orderCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Order',
    },
  },
};

export async function orderCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.orderCreate, context);
  return await orderCreate(body, context);
}

export async function orderCreate(body: unknown, context: AppContext) {
  const data = orderCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);

  let order = await prisma.order.create({
    data: {
      side: data.side,
      type: data.type,
      price: data.price,
      quantity: data.quantity,
      quantityFilled: data.quantityFilled,
      status: data.status,
      timeInFore: data.timeInFore,
      meta: data.meta,
      account: prismaRelationship.connectOne(data.account),
      instrument: prismaRelationship.connectOne(data.instrument),
      importHash: data.importHash,
    },
    include: {
      account: true,
      instrument: true,
      buys: true,
      sells: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  // Map local enums to Protobuf Enums
  // Note: This mapping depends on your string values matching logic.
  // Ideally, align your DB enums with Proto enums or use a helper.
  const side =
    data.side === 'buy'
      ? OrderSide.ORDER_SIDE_BUY
      : data.side === 'sell'
      ? OrderSide.ORDER_SIDE_SELL
      : OrderSide.ORDER_SIDE_UNSPECIFIED;

  const type =
    data.type === 'limit'
      ? OrderType.ORDER_TYPE_LIMIT
      : data.type === 'market'
      ? OrderType.ORDER_TYPE_MARKET
      : OrderType.ORDER_TYPE_UNSPECIFIED;

  // Send to Matching Engine
  try {
    await matchingEngineClient.placeOrder({
      order: {
        id: order.id,
        tenantId: order.tenantId,
        side: side,
        type: type,
        price: order.price ? order.price.toString() : '0',
        quantity: order.quantity ? order.quantity.toString() : '0',
        quantityFilled: order.quantityFilled
          ? order.quantityFilled.toString()
          : '0',
        status: OrderStatus.ORDER_STATUS_OPEN, // Default to OPEN for new orders
        timeInForce: TimeInForce.TIME_IN_FORCE_GTC, // Default or map from data
        accountId: order.accountId || '',
        instrumentId: order.instrumentId || '',
        meta: JSON.stringify(order.meta),
        createdAt: order.createdAt.getTime().toString(),
        updatedAt: order.updatedAt.getTime().toString(),
      },
    });
  } catch (error) {
    console.error('Failed to send order to Matching Engine:', error);
    // TODO: Decide how to handle failure.
    // Option A: Delete the order from DB (Atomic rollblack)?
    // Option B: Mark order as 'failed_to_submit'?
    // For now, we log it.
  }

  order = await filePopulateDownloadUrlInTree(order);

  return order;
}
