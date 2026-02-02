import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  balanceSnapshotUpdateBodyInputSchema,
  balanceSnapshotUpdateParamsInputSchema,
} from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const balanceSnapshotUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/balance-snapshot/{id}',
  request: {
    params: balanceSnapshotUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: balanceSnapshotUpdateBodyInputSchema,
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

export async function balanceSnapshotUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.balanceSnapshotUpdate,
    context,
  );

  const { id } = balanceSnapshotUpdateParamsInputSchema.parse(params);

  const data = balanceSnapshotUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.balanceSnapshot.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      available: data.available,
      locked: data.locked,
      total: data.total,
      snapshotAt: data.snapshotAt,
      meta: data.meta,
      account: prismaRelationship.connectOrDisconnectOne(data.account),
      wallet: prismaRelationship.connectOrDisconnectOne(data.wallet),
      asset: prismaRelationship.connectOrDisconnectOne(data.asset),
    },
  });

  let balanceSnapshot = await prisma.balanceSnapshot.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
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
