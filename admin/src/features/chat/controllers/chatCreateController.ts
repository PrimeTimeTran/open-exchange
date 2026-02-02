import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chatCreateInputSchema } from 'src/features/chat/chatSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const chatCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/chat',
  request: {
    body: {
      content: {
        'application/json': {
          schema: chatCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Chat',
    },
  },
};

export async function chatCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.chatCreate, context);
  return await chatCreate(body, context);
}

export async function chatCreate(body: unknown, context: AppContext) {
  const data = chatCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let chat = await prisma.chat.create({
    data: {
      name: data.name,
      media: data.media,
      meta: data.meta,
      active: data.active,
      importHash: data.importHash,
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
