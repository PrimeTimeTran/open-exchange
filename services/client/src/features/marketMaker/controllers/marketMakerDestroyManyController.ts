import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { marketMakerDestroyManyInputSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const marketMakerDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/market-maker',
  request: {
    query: marketMakerDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function marketMakerDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.marketMakerDestroy,
    context,
  );

  const { ids } = marketMakerDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.marketMaker.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
