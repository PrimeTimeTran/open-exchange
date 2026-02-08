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

  try {
    await matchingEngineClient.placeOrder({
      order: mapOrderToProto(order),
    });
  } catch (error) {
    console.error('Failed to place order in matching engine', error);
    // TODO: Handle failure (e.g. mark order as failed in DB)
  }

  order = await filePopulateDownloadUrlInTree(order);

  return order;
}

function mapOrderToProto(order: any) {
  return {
    id: order.id,
    tenantId: order.tenantId,
    side: mapOrderSide(order.side),
    type: mapOrderType(order.type),
    price: order.price?.toString() ?? '0',
    quantity: order.quantity?.toString() ?? '0',
    quantityFilled: order.quantityFilled?.toString() ?? '0',
    status: mapOrderStatus(order.status),
    timeInForce: mapTimeInForce(order.timeInFore),
    accountId: order.accountId ?? '',
    instrumentId: order.instrumentId ?? '',
    meta: order.meta ? JSON.stringify(order.meta) : '',
    createdAt: order.createdAt.getTime().toString(),
    updatedAt: order.updatedAt.getTime().toString(),
  };
}

function mapOrderSide(side: string | null | undefined): OrderSide {
  switch (side) {
    case 'buy':
      return OrderSide.ORDER_SIDE_BUY;
    case 'sell':
      return OrderSide.ORDER_SIDE_SELL;
    default:
      return OrderSide.ORDER_SIDE_UNSPECIFIED;
  }
}

function mapOrderType(type: string | null | undefined): OrderType {
  switch (type) {
    case 'limit':
      return OrderType.ORDER_TYPE_LIMIT;
    case 'market':
      return OrderType.ORDER_TYPE_MARKET;
    default:
      return OrderType.ORDER_TYPE_UNSPECIFIED;
  }
}

function mapOrderStatus(status: string | null | undefined): OrderStatus {
  switch (status) {
    case 'open':
      return OrderStatus.ORDER_STATUS_OPEN;
    case 'partially_filled':
      return OrderStatus.ORDER_STATUS_PARTIALLY_FILLED;
    case 'filled':
      return OrderStatus.ORDER_STATUS_FILLED;
    case 'cancelled':
      return OrderStatus.ORDER_STATUS_CANCELLED;
    case 'rejected':
      return OrderStatus.ORDER_STATUS_REJECTED;
    default:
      return OrderStatus.ORDER_STATUS_UNSPECIFIED;
  }
}

function mapTimeInForce(timeInForce: string | null | undefined): TimeInForce {
  switch (timeInForce) {
    case 'gtc':
      return TimeInForce.TIME_IN_FORCE_GTC;
    case 'ioc':
      return TimeInForce.TIME_IN_FORCE_IOC;
    case 'fok':
      return TimeInForce.TIME_IN_FORCE_FOK;
    default:
      return TimeInForce.TIME_IN_FORCE_UNSPECIFIED;
  }
}
