import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chateeCreateInputSchema } from 'src/features/chatee/chateeSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const chateeCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/chatee',
  request: {
    body: {
      content: {
        'application/json': {
          schema: chateeCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Chatee',
    },
  },
};

export async function chateeCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.chateeCreate, context);
  return await chateeCreate(body, context);
}

export async function chateeCreate(body: unknown, context: AppContext) {
  const data = chateeCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let chatee = await prisma.chatee.create({
    data: {
      nickname: data.nickname,
      status: data.status,
      role: data.role,
      meta: data.meta,
      user: prismaRelationship.connectOne(data.user),
      chat: prismaRelationship.connectOne(data.chat),
      importHash: data.importHash,
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
