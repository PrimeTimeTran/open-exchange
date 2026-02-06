import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { messageFindSchema } from 'src/features/message/messageSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const messageFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/message/{id}',
  request: {
    params: messageFindSchema,
  },
  responses: {
    200: {
      description: 'Message',
    },
  },
};

export async function messageFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.messageRead,
    context,
  );

  const { id } = messageFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let message = await prisma.message.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      chat: true,
      chater: true,
      sender: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  message = await filePopulateDownloadUrlInTree(message);

  return message;
}
