import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { balanceSnapshotDestroyManyInputSchema } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const balanceSnapshotDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/balance-snapshot',
  request: {
    query: balanceSnapshotDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function balanceSnapshotDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.balanceSnapshotDestroy,
    context,
  );

  const { ids } = balanceSnapshotDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.balanceSnapshot.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
