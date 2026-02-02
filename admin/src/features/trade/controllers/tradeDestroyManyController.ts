import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeDestroyManyInputSchema } from 'src/features/trade/tradeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const tradeDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/trade',
  request: {
    query: tradeDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function tradeDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeDestroy,
    context,
  );

  const { ids } = tradeDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.trade.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
