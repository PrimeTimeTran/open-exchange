import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { accountFindSchema } from 'src/features/account/accountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const accountFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/account/{id}',
  request: {
    params: accountFindSchema,
  },
  responses: {
    200: {
      description: 'Account',
    },
  },
};

export async function accountFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.accountRead,
    context,
  );

  const { id } = accountFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let account = await prisma.account.findUnique({
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
