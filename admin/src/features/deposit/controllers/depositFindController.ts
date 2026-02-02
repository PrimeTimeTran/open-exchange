import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { depositFindSchema } from 'src/features/deposit/depositSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const depositFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/deposit/{id}',
  request: {
    params: depositFindSchema,
  },
  responses: {
    200: {
      description: 'Deposit',
    },
  },
};

export async function depositFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.depositRead,
    context,
  );

  const { id } = depositFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let deposit = await prisma.deposit.findUnique({
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
