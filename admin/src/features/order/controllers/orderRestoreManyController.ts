import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { orderRestoreManyInputSchema } from 'src/features/order/orderSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const orderRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/order/restore',
  request: {
    query: orderRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function orderRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.orderRestore,
    context,
  );

  const { ids } = orderRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.order.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: null,
      archivedByMembershipId: null,
    },
  });
}
