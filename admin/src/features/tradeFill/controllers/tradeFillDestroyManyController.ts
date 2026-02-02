import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeFillDestroyManyInputSchema } from 'src/features/tradeFill/tradeFillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const tradeFillDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/trade-fill',
  request: {
    query: tradeFillDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function tradeFillDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeFillDestroy,
    context,
  );

  const { ids } = tradeFillDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.tradeFill.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
