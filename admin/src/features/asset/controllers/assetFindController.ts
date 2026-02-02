import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { assetFindSchema } from 'src/features/asset/assetSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const assetFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/asset/{id}',
  request: {
    params: assetFindSchema,
  },
  responses: {
    200: {
      description: 'Asset',
    },
  },
};

export async function assetFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.assetRead,
    context,
  );

  const { id } = assetFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let asset = await prisma.asset.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      baseInstruments: true,
      quoteInstruments: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  asset = await filePopulateDownloadUrlInTree(asset);

  return asset;
}
