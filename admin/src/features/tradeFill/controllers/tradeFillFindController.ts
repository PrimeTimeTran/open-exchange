import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeFillFindSchema } from 'src/features/tradeFill/tradeFillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const tradeFillFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/trade-fill/{id}',
  request: {
    params: tradeFillFindSchema,
  },
  responses: {
    200: {
      description: 'TradeFill',
    },
  },
};

export async function tradeFillFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeFillRead,
    context,
  );

  const { id } = tradeFillFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let tradeFill = await prisma.tradeFill.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      trade: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  tradeFill = await filePopulateDownloadUrlInTree(tradeFill);

  return tradeFill;
}
