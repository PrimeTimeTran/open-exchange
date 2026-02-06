import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chaterCreateInputSchema } from 'src/features/chater/chaterSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const chaterCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/chater',
  request: {
    body: {
      content: {
        'application/json': {
          schema: chaterCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Chater',
    },
  },
};

export async function chaterCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.chaterCreate, context);
  return await chaterCreate(body, context);
}

export async function chaterCreate(body: unknown, context: AppContext) {
  const data = chaterCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let chater = await prisma.chater.create({
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

  chater = await filePopulateDownloadUrlInTree(chater);

  return chater;
}
