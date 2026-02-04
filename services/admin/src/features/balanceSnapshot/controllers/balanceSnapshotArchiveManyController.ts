import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { balanceSnapshotArchiveManyInputSchema as balanceSnapshotArchiveManyInputSchema } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const balanceSnapshotArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/balance-snapshot/archive',
  request: {
    query: balanceSnapshotArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function balanceSnapshotArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.balanceSnapshotArchive,
    context,
  );

  const { ids } = balanceSnapshotArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.balanceSnapshot.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: new Date(),
      archivedByMembershipId: context.currentMembership!.id,
    },
  });
}
