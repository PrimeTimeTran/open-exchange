import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  withdrawalUpdateBodyInputSchema,
  withdrawalUpdateParamsInputSchema,
} from 'src/features/withdrawal/withdrawalSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const withdrawalUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/withdrawal/{id}',
  request: {
    params: withdrawalUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: withdrawalUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Withdrawal',
    },
  },
};

export async function withdrawalUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.withdrawalUpdate,
    context,
  );

  const { id } = withdrawalUpdateParamsInputSchema.parse(params);

  const data = withdrawalUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.withdrawal.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      amount: data.amount,
      fee: data.fee,
      status: data.status,
      destinationAddress: data.destinationAddress,
      destinationTag: data.destinationTag,
      chain: data.chain,
      txHash: data.txHash,
      failureReason: data.failureReason,
      requestedBy: data.requestedBy,
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt,
      requestedAt: data.requestedAt,
      broadcastAt: data.broadcastAt,
      confirmedAt: data.confirmedAt,
      confirmations: data.confirmations,
      meta: data.meta,
      account: prismaRelationship.connectOrDisconnectOne(data.account),
      asset: prismaRelationship.connectOrDisconnectOne(data.asset),
    },
  });

  let withdrawal = await prisma.withdrawal.findUniqueOrThrow({
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

  withdrawal = await filePopulateDownloadUrlInTree(withdrawal);

  return withdrawal;
}
