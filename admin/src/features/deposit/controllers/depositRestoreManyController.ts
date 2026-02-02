import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { depositRestoreManyInputSchema } from 'src/features/deposit/depositSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const depositRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/deposit/restore',
  request: {
    query: depositRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function depositRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.depositRestore,
    context,
  );

  const { ids } = depositRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.deposit.updateMany({
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
