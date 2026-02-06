import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { listingRestoreManyInputSchema } from 'src/features/listing/listingSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const listingRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/listing/restore',
  request: {
    query: listingRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function listingRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.listingRestore,
    context,
  );

  const { ids } = listingRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.listing.updateMany({
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
