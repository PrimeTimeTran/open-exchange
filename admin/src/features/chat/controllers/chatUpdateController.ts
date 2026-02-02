import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  chatUpdateBodyInputSchema,
  chatUpdateParamsInputSchema,
} from 'src/features/chat/chatSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const chatUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chat/{id}',
  request: {
    params: chatUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: chatUpdateBodyInputSchema,
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

export async function chatUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chatUpdate,
    context,
  );

  const { id } = chatUpdateParamsInputSchema.parse(params);

  const data = chatUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.chat.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      name: data.name,
      media: data.media,
      meta: data.meta,
      active: data.active,
    },
  });

  let chat = await prisma.chat.findUniqueOrThrow({
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
