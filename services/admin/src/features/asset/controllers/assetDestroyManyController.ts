import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { assetDestroyManyInputSchema } from 'src/features/asset/assetSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const assetDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/asset',
  request: {
    query: assetDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function assetDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.assetDestroy,
    context,
  );

  const { ids } = assetDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.asset.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
