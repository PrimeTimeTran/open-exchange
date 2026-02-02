import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeFillRestoreManyInputSchema } from 'src/features/tradeFill/tradeFillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const tradeFillRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/trade-fill/restore',
  request: {
    query: tradeFillRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function tradeFillRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeFillRestore,
    context,
  );

  const { ids } = tradeFillRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.tradeFill.updateMany({
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
