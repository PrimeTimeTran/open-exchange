import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chatFindSchema } from 'src/features/chat/chatSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const chatFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chat/{id}',
  request: {
    params: chatFindSchema,
  },
  responses: {
    200: {
      description: 'Chat',
    },
  },
};

export async function chatFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chatRead,
    context,
  );

  const { id } = chatFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let chat = await prisma.chat.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      messages: true,
      chatees: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  chat = await filePopulateDownloadUrlInTree(chat);

  return chat;
}
