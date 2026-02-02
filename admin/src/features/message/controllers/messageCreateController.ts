import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { messageCreateInputSchema } from 'src/features/message/messageSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const messageCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/message',
  request: {
    body: {
      content: {
        'application/json': {
          schema: messageCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message',
    },
  },
};

export async function messageCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.messageCreate, context);
  return await messageCreate(body, context);
}

export async function messageCreate(body: unknown, context: AppContext) {
  const data = messageCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let message = await prisma.message.create({
    data: {
      body: data.body,
      attachment: data.attachment,
      images: data.images,
      type: data.type,
      meta: data.meta,
      chat: prismaRelationship.connectOne(data.chat),
      chatee: prismaRelationship.connectOne(data.chatee),
      sender: prismaRelationship.connectOne(data.sender),
      importHash: data.importHash,
    },
    include: {
      chat: true,
      chatee: true,
      sender: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  message = await filePopulateDownloadUrlInTree(message);

  return message;
}
