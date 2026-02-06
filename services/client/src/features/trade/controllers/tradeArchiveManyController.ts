import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeArchiveManyInputSchema as tradeArchiveManyInputSchema } from 'src/features/trade/tradeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const tradeArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/trade/archive',
  request: {
    query: tradeArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function tradeArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeArchive,
    context,
  );

  const { ids } = tradeArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.trade.updateMany({
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
