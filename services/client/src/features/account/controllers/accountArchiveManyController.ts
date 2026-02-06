import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { accountArchiveManyInputSchema as accountArchiveManyInputSchema } from 'src/features/account/accountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const accountArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/account/archive',
  request: {
    query: accountArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function accountArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.accountArchive,
    context,
  );

  const { ids } = accountArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.account.updateMany({
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
