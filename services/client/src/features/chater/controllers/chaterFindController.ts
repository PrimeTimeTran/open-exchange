import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chaterFindSchema } from 'src/features/chater/chaterSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const chaterFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chater/{id}',
  request: {
    params: chaterFindSchema,
  },
  responses: {
    200: {
      description: 'Chater',
    },
  },
};

export async function chaterFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chaterRead,
    context,
  );

  const { id } = chaterFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let chater = await prisma.chater.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      user: true,
      chat: true,
      messages: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  chater = await filePopulateDownloadUrlInTree(chater);

  return chater;
}
