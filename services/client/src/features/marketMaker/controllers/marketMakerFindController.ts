import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { marketMakerFindSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const marketMakerFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/market-maker/{id}',
  request: {
    params: marketMakerFindSchema,
  },
  responses: {
    200: {
      description: 'MarketMaker',
    },
  },
};

export async function marketMakerFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.marketMakerRead,
    context,
  );

  const { id } = marketMakerFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let marketMaker = await prisma.marketMaker.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  marketMaker = await filePopulateDownloadUrlInTree(marketMaker);

  return marketMaker;
}
