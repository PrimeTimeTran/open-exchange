import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { orderArchiveManyInputSchema as orderArchiveManyInputSchema } from 'src/features/order/orderSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const orderArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/order/archive',
  request: {
    query: orderArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function orderArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.orderArchive,
    context,
  );

  const { ids } = orderArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.order.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: new Date(),
      archivedByMembershipId: context.currentMembership!.id,
    },
  });
}
