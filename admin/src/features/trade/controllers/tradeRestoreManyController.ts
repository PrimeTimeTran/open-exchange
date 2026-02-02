import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeRestoreManyInputSchema } from 'src/features/trade/tradeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const tradeRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/trade/restore',
  request: {
    query: tradeRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function tradeRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeRestore,
    context,
  );

  const { ids } = tradeRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.trade.updateMany({
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
