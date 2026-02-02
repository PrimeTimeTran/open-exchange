import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  messageUpdateBodyInputSchema,
  messageUpdateParamsInputSchema,
} from 'src/features/message/messageSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const messageUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/message/{id}',
  request: {
    params: messageUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: messageUpdateBodyInputSchema,
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

export async function messageUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.messageUpdate,
    context,
  );

  const { id } = messageUpdateParamsInputSchema.parse(params);

  const data = messageUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.message.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      body: data.body,
      attachment: data.attachment,
      images: data.images,
      type: data.type,
      meta: data.meta,
      chat: prismaRelationship.connectOrDisconnectOne(data.chat),
      chatee: prismaRelationship.connectOrDisconnectOne(data.chatee),
      sender: prismaRelationship.connectOrDisconnectOne(data.sender),
    },
  });

  let message = await prisma.message.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
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
