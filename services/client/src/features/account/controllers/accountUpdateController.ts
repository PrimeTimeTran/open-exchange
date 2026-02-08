import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  accountUpdateBodyInputSchema,
  accountUpdateParamsInputSchema,
} from 'src/features/account/accountSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const accountUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/account/{id}',
  request: {
    params: accountUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: accountUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Account',
    },
  },
};

export async function accountUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.accountUpdate,
    context,
  );

  const { id } = accountUpdateParamsInputSchema.parse(params);

  const data = accountUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.account.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      name: data.name,
      isSystem: data.isSystem,
      type: data.type,
      status: data.status,
      isInterest: data.isInterest,
      interestRate: data.interestRate,
      meta: data.meta,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
    },
  });

  let account = await prisma.account.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      user: true,
      orders: true,
      wallets: true,
      deposits: true,
      withdrawals: true,
      snapshots: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  account = await filePopulateDownloadUrlInTree(account);

  return account;
}
