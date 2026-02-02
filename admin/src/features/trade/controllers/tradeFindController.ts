import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeFindSchema } from 'src/features/trade/tradeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const tradeFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/trade/{id}',
  request: {
    params: tradeFindSchema,
  },
  responses: {
    200: {
      description: 'Trade',
    },
  },
};

export async function tradeFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeRead,
    context,
  );

  const { id } = tradeFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let trade = await prisma.trade.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      buyOrderId: true,
      sellOrderId: true,
      instrument: true,
      tradeFills: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  trade = await filePopulateDownloadUrlInTree(trade);

  return trade;
}
