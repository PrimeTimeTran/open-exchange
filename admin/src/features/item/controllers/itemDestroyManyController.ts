import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { itemDestroyManyInputSchema } from 'src/features/item/itemSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const itemDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/item',
  request: {
    query: itemDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function itemDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.itemDestroy,
    context,
  );

  const { ids } = itemDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.item.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
