import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { walletCreateInputSchema } from 'src/features/wallet/walletSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const walletCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/wallet',
  request: {
    body: {
      content: {
        'application/json': {
          schema: walletCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Wallet',
    },
  },
};

export async function walletCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.walletCreate, context);
  return await walletCreate(body, context);
}

export async function walletCreate(body: unknown, context: AppContext) {
  const data = walletCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let wallet = await prisma.wallet.create({
    data: {
      available: data.available,
      locked: data.locked,
      total: data.total,
      version: data.version,
      meta: data.meta,
      user: prismaRelationship.connectOne(data.user),
      asset: prismaRelationship.connectOne(data.asset),
      account: prismaRelationship.connectOne(data.account),
      importHash: data.importHash,
    },
    include: {
      user: true,
      asset: true,
      account: true,
      snapshots: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  wallet = await filePopulateDownloadUrlInTree(wallet);

  return wallet;
}
