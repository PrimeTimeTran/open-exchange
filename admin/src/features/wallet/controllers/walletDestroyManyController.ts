import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { walletDestroyManyInputSchema } from 'src/features/wallet/walletSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const walletDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/wallet',
  request: {
    query: walletDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function walletDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.walletDestroy,
    context,
  );

  const { ids } = walletDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.wallet.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
