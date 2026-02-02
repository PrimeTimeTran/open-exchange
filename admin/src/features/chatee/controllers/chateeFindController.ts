import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chateeFindSchema } from 'src/features/chatee/chateeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const chateeFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chatee/{id}',
  request: {
    params: chateeFindSchema,
  },
  responses: {
    200: {
      description: 'Chatee',
    },
  },
};

export async function chateeFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chateeRead,
    context,
  );

  const { id } = chateeFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let chatee = await prisma.chatee.findUnique({
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

  chatee = await filePopulateDownloadUrlInTree(chatee);

  return chatee;
}
