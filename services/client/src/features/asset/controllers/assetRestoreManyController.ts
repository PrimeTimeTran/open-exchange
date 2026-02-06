import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { assetRestoreManyInputSchema } from 'src/features/asset/assetSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const assetRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/asset/restore',
  request: {
    query: assetRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function assetRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.assetRestore,
    context,
  );

  const { ids } = assetRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.asset.updateMany({
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
