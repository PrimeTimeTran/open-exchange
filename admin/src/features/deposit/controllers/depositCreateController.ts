import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { depositCreateInputSchema } from 'src/features/deposit/depositSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const depositCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/deposit',
  request: {
    body: {
      content: {
        'application/json': {
          schema: depositCreateInputSchema,
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

export async function depositCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.depositCreate, context);
  return await depositCreate(body, context);
}

export async function depositCreate(body: unknown, context: AppContext) {
  const data = depositCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let deposit = await prisma.deposit.create({
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

  deposit = await filePopulateDownloadUrlInTree(deposit);

  return deposit;
}
