import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { withdrawalRestoreManyInputSchema } from 'src/features/withdrawal/withdrawalSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const withdrawalRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/withdrawal/restore',
  request: {
    query: withdrawalRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function withdrawalRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.withdrawalRestore,
    context,
  );

  const { ids } = withdrawalRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.withdrawal.updateMany({
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
