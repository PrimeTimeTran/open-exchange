import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { assetArchiveManyInputSchema as assetArchiveManyInputSchema } from 'src/features/asset/assetSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const assetArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/asset/archive',
  request: {
    query: assetArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function assetArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.assetArchive,
    context,
  );

  const { ids } = assetArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.asset.updateMany({
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
