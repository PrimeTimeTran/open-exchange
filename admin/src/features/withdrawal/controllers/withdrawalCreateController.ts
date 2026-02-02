import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { withdrawalCreateInputSchema } from 'src/features/withdrawal/withdrawalSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const withdrawalCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/withdrawal',
  request: {
    body: {
      content: {
        'application/json': {
          schema: withdrawalCreateInputSchema,
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

export async function withdrawalCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.withdrawalCreate, context);
  return await withdrawalCreate(body, context);
}

export async function withdrawalCreate(body: unknown, context: AppContext) {
  const data = withdrawalCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let withdrawal = await prisma.withdrawal.create({
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
      account: prismaRelationship.connectOne(data.account),
      asset: prismaRelationship.connectOne(data.asset),
      importHash: data.importHash,
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
