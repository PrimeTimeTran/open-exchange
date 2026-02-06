import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { listingArchiveManyInputSchema as listingArchiveManyInputSchema } from 'src/features/listing/listingSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const listingArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/listing/archive',
  request: {
    query: listingArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function listingArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.listingArchive,
    context,
  );

  const { ids } = listingArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.listing.updateMany({
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
