import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { listingDestroyManyInputSchema } from 'src/features/listing/listingSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const listingDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/listing',
  request: {
    query: listingDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function listingDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.listingDestroy,
    context,
  );

  const { ids } = listingDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.listing.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
