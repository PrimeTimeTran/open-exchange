import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { systemAccountFindSchema } from 'src/features/systemAccount/systemAccountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const systemAccountFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/system-account/{id}',
  request: {
    params: systemAccountFindSchema,
  },
  responses: {
    200: {
      description: 'SystemAccount',
    },
  },
};

export async function systemAccountFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.systemAccountRead,
    context,
  );

  const { id } = systemAccountFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let systemAccount = await prisma.systemAccount.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  systemAccount = await filePopulateDownloadUrlInTree(systemAccount);

  return systemAccount;
}
