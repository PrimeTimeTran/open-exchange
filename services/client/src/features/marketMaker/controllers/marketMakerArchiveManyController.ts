import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { marketMakerArchiveManyInputSchema as marketMakerArchiveManyInputSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const marketMakerArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/market-maker/archive',
  request: {
    query: marketMakerArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function marketMakerArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.marketMakerArchive,
    context,
  );

  const { ids } = marketMakerArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.marketMaker.updateMany({
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
