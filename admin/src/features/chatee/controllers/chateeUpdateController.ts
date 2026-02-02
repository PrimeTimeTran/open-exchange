import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  chateeUpdateBodyInputSchema,
  chateeUpdateParamsInputSchema,
} from 'src/features/chatee/chateeSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const chateeUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chatee/{id}',
  request: {
    params: chateeUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: chateeUpdateBodyInputSchema,
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

export async function chateeUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chateeUpdate,
    context,
  );

  const { id } = chateeUpdateParamsInputSchema.parse(params);

  const data = chateeUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.chatee.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      nickname: data.nickname,
      status: data.status,
      role: data.role,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
      chat: prismaRelationship.connectOrDisconnectOne(data.chat),
    },
  });

  let chatee = await prisma.chatee.findUniqueOrThrow({
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
