import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  depositUpdateBodyInputSchema,
  depositUpdateParamsInputSchema,
} from 'src/features/deposit/depositSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const depositUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/deposit/{id}',
  request: {
    params: depositUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: depositUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Deposit',
    },
  },
};

export async function depositUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.depositUpdate,
    context,
  );

  const { id } = depositUpdateParamsInputSchema.parse(params);

  const data = depositUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.deposit.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      amount: data.amount,
      status: data.status,
      chain: data.chain,
      txHash: data.txHash,
      fromAddress: data.fromAddress,
      confirmations: data.confirmations,
      requiredConfirmations: data.requiredConfirmations,
      detectedAt: data.detectedAt,
      confirmedAt: data.confirmedAt,
      creditedAt: data.creditedAt,
      meta: data.meta,
      account: prismaRelationship.connectOrDisconnectOne(data.account),
      asset: prismaRelationship.connectOrDisconnectOne(data.asset),
    },
  });

  let deposit = await prisma.deposit.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      account: true,
      asset: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  deposit = await filePopulateDownloadUrlInTree(deposit);

  return deposit;
}
