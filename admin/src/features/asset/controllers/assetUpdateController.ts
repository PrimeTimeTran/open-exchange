import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  assetUpdateBodyInputSchema,
  assetUpdateParamsInputSchema,
} from 'src/features/asset/assetSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const assetUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/asset/{id}',
  request: {
    params: assetUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: assetUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Asset',
    },
  },
};

export async function assetUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.assetUpdate,
    context,
  );

  const { id } = assetUpdateParamsInputSchema.parse(params);

  const data = assetUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.asset.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      symbol: data.symbol,
      type: data.type,
      precision: data.precision,
      isFractional: data.isFractional,
      meta: data.meta,
    },
  });

  let asset = await prisma.asset.findUniqueOrThrow({
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
