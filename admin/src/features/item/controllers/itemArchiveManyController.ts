import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { itemArchiveManyInputSchema as itemArchiveManyInputSchema } from 'src/features/item/itemSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const itemArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/item/archive',
  request: {
    query: itemArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function itemArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.itemArchive,
    context,
  );

  const { ids } = itemArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.item.updateMany({
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
