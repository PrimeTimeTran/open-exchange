import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { orderCreateInputSchema } from 'src/features/order/orderSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

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

  order = await filePopulateDownloadUrlInTree(order);

  return order;
}
