import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { withdrawalArchiveManyInputSchema as withdrawalArchiveManyInputSchema } from 'src/features/withdrawal/withdrawalSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const withdrawalArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/withdrawal/archive',
  request: {
    query: withdrawalArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function withdrawalArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.withdrawalArchive,
    context,
  );

  const { ids } = withdrawalArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.withdrawal.updateMany({
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
