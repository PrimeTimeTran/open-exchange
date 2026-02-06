import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { marketMakerRestoreManyInputSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const marketMakerRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/market-maker/restore',
  request: {
    query: marketMakerRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function marketMakerRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.marketMakerRestore,
    context,
  );

  const { ids } = marketMakerRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.marketMaker.updateMany({
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
