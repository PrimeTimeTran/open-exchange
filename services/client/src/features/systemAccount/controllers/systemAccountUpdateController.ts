import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  systemAccountUpdateBodyInputSchema,
  systemAccountUpdateParamsInputSchema,
} from 'src/features/systemAccount/systemAccountSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const systemAccountUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/system-account/{id}',
  request: {
    params: systemAccountUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: systemAccountUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'SystemAccount',
    },
  },
};

export async function systemAccountUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.systemAccountUpdate,
    context,
  );

  const { id } = systemAccountUpdateParamsInputSchema.parse(params);

  const data = systemAccountUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.systemAccount.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      type: data.type,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      meta: data.meta,
    },
  });

  let systemAccount = await prisma.systemAccount.findUniqueOrThrow({
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
