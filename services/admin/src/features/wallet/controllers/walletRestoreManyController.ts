import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { walletRestoreManyInputSchema } from 'src/features/wallet/walletSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const walletRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/wallet/restore',
  request: {
    query: walletRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function walletRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.walletRestore,
    context,
  );

  const { ids } = walletRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.wallet.updateMany({
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
