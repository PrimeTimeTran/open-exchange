import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { orderDestroyManyInputSchema } from 'src/features/order/orderSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const orderDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/order',
  request: {
    query: orderDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function orderDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.orderDestroy,
    context,
  );

  const { ids } = orderDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.order.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
