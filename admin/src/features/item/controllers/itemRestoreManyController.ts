import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { itemRestoreManyInputSchema } from 'src/features/item/itemSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const itemRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/item/restore',
  request: {
    query: itemRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function itemRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.itemRestore,
    context,
  );

  const { ids } = itemRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.item.updateMany({
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
