import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { balanceSnapshotCreateInputSchema } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const balanceSnapshotCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/balance-snapshot',
  request: {
    body: {
      content: {
        'application/json': {
          schema: balanceSnapshotCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'BalanceSnapshot',
    },
  },
};

export async function balanceSnapshotCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.balanceSnapshotCreate, context);
  return await balanceSnapshotCreate(body, context);
}

export async function balanceSnapshotCreate(body: unknown, context: AppContext) {
  const data = balanceSnapshotCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let balanceSnapshot = await prisma.balanceSnapshot.create({
    data: {
      available: data.available,
      locked: data.locked,
      total: data.total,
      snapshotAt: data.snapshotAt,
      meta: data.meta,
      account: prismaRelationship.connectOne(data.account),
      wallet: prismaRelationship.connectOne(data.wallet),
      asset: prismaRelationship.connectOne(data.asset),
      importHash: data.importHash,
    },
    include: {
      account: true,
      wallet: true,
      asset: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  balanceSnapshot = await filePopulateDownloadUrlInTree(balanceSnapshot);

  return balanceSnapshot;
}
