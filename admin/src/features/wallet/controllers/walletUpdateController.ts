import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  walletUpdateBodyInputSchema,
  walletUpdateParamsInputSchema,
} from 'src/features/wallet/walletSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const walletUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/wallet/{id}',
  request: {
    params: walletUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: walletUpdateBodyInputSchema,
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

export async function walletUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.walletUpdate,
    context,
  );

  const { id } = walletUpdateParamsInputSchema.parse(params);

  const data = walletUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.wallet.update({
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
      version: data.version,
      meta: data.meta,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
      asset: prismaRelationship.connectOrDisconnectOne(data.asset),
      account: prismaRelationship.connectOrDisconnectOne(data.account),
    },
  });

  let wallet = await prisma.wallet.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
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
