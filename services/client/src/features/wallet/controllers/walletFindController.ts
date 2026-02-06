import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { walletFindSchema } from 'src/features/wallet/walletSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const walletFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/wallet/{id}',
  request: {
    params: walletFindSchema,
  },
  responses: {
    200: {
      description: 'Wallet',
    },
  },
};

export async function walletFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.walletRead,
    context,
  );

  const { id } = walletFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let wallet = await prisma.wallet.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      user: true,
      asset: true,
      account: true,
      snapshots: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  wallet = await filePopulateDownloadUrlInTree(wallet);

  return wallet;
}
