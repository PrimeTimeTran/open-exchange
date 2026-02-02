import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { balanceSnapshotFindSchema } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const balanceSnapshotFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/balance-snapshot/{id}',
  request: {
    params: balanceSnapshotFindSchema,
  },
  responses: {
    200: {
      description: 'BalanceSnapshot',
    },
  },
};

export async function balanceSnapshotFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.balanceSnapshotRead,
    context,
  );

  const { id } = balanceSnapshotFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let balanceSnapshot = await prisma.balanceSnapshot.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      account: true,
      wallet: true,
      asset: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  balanceSnapshot = await filePopulateDownloadUrlInTree(balanceSnapshot);

  return balanceSnapshot;
}
