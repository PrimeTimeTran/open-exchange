import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { accountRestoreManyInputSchema } from 'src/features/account/accountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const accountRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/account/restore',
  request: {
    query: accountRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function accountRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.accountRestore,
    context,
  );

  const { ids } = accountRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.account.updateMany({
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
