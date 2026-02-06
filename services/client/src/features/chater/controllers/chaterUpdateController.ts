import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  chaterUpdateBodyInputSchema,
  chaterUpdateParamsInputSchema,
} from 'src/features/chater/chaterSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const chaterUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chater/{id}',
  request: {
    params: chaterUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: chaterUpdateBodyInputSchema,
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

export async function chaterUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chaterUpdate,
    context,
  );

  const { id } = chaterUpdateParamsInputSchema.parse(params);

  const data = chaterUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.chater.update({
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
      meta: data.meta,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
      chat: prismaRelationship.connectOrDisconnectOne(data.chat),
    },
  });

  let chater = await prisma.chater.findUniqueOrThrow({
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

  chater = await filePopulateDownloadUrlInTree(chater);

  return chater;
}
