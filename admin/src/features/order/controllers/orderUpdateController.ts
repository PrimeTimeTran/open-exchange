import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  orderUpdateBodyInputSchema,
  orderUpdateParamsInputSchema,
} from 'src/features/order/orderSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const orderUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/order/{id}',
  request: {
    params: orderUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: orderUpdateBodyInputSchema,
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

export async function orderUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.orderUpdate,
    context,
  );

  const { id } = orderUpdateParamsInputSchema.parse(params);

  const data = orderUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.order.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      meta: data.meta,
      side: data.side,
      type: data.type,
      price: data.price,
      quantity: data.quantity,
      status: data.status,
      timeInFore: data.timeInFore,
      quantityFilled: data.quantityFilled,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
      account: prismaRelationship.connectOrDisconnectOne(data.account),
      instrument: prismaRelationship.connectOrDisconnectOne(data.instrument),
    },
  });

  let order = await prisma.order.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      user: true,
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
