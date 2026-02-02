import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { balanceSnapshotRestoreManyInputSchema } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const balanceSnapshotRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/balance-snapshot/restore',
  request: {
    query: balanceSnapshotRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function balanceSnapshotRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.balanceSnapshotRestore,
    context,
  );

  const { ids } = balanceSnapshotRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.balanceSnapshot.updateMany({
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
