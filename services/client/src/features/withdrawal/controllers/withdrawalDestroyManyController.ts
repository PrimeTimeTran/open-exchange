import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { withdrawalDestroyManyInputSchema } from 'src/features/withdrawal/withdrawalSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const withdrawalDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/withdrawal',
  request: {
    query: withdrawalDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function withdrawalDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.withdrawalDestroy,
    context,
  );

  const { ids } = withdrawalDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.withdrawal.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
