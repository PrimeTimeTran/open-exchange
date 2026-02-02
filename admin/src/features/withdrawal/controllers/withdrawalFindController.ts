import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { withdrawalFindSchema } from 'src/features/withdrawal/withdrawalSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const withdrawalFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/withdrawal/{id}',
  request: {
    params: withdrawalFindSchema,
  },
  responses: {
    200: {
      description: 'Withdrawal',
    },
  },
};

export async function withdrawalFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.withdrawalRead,
    context,
  );

  const { id } = withdrawalFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let withdrawal = await prisma.withdrawal.findUnique({
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
