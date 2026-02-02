import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { orderFindSchema } from 'src/features/order/orderSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const orderFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/order/{id}',
  request: {
    params: orderFindSchema,
  },
  responses: {
    200: {
      description: 'Order',
    },
  },
};

export async function orderFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.orderRead,
    context,
  );

  const { id } = orderFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let order = await prisma.order.findUnique({
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
