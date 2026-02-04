import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { assetCreateInputSchema } from 'src/features/asset/assetSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const assetCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/asset',
  request: {
    body: {
      content: {
        'application/json': {
          schema: assetCreateInputSchema,
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

export async function assetCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.assetCreate, context);
  return await assetCreate(body, context);
}

export async function assetCreate(body: unknown, context: AppContext) {
  const data = assetCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let asset = await prisma.asset.create({
    data: {
      symbol: data.symbol,
      type: data.type,
      precision: data.precision,
      isFractional: data.isFractional,
      meta: data.meta,
      decimals: data.decimals,
      importHash: data.importHash,
    },
    include: {
      baseInstruments: true,
      quoteInstruments: true,
      wallets: true,
      deposits: true,
      withdrawals: true,
      snapshots: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  asset = await filePopulateDownloadUrlInTree(asset);

  return asset;
}
