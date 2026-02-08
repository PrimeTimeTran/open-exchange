import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { accountCreateInputSchema } from 'src/features/account/accountSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const accountCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/account',
  request: {
    body: {
      content: {
        'application/json': {
          schema: accountCreateInputSchema,
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

export async function accountCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.accountCreate, context);
  return await accountCreate(body, context);
}

export async function accountCreate(body: unknown, context: AppContext) {
  const data = accountCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let account = await prisma.account.create({
    data: {
      name: data.name,
      isSystem: data.isSystem,
      type: data.type,
      status: data.status,
      isInterest: data.isInterest,
      interestRate: data.interestRate,
      meta: data.meta,
      user: prismaRelationship.connectOne(data.user),
      importHash: data.importHash,
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
