import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { walletArchiveManyInputSchema as walletArchiveManyInputSchema } from 'src/features/wallet/walletSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const walletArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/wallet/archive',
  request: {
    query: walletArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function walletArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.walletArchive,
    context,
  );

  const { ids } = walletArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.wallet.updateMany({
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
