import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  postUpdateBodyInputSchema,
  postUpdateParamsInputSchema,
} from 'src/features/post/postSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const postUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/post/{id}',
  request: {
    params: postUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: postUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Post',
    },
  },
};

export async function postUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.postUpdate,
    context,
  );

  const { id } = postUpdateParamsInputSchema.parse(params);

  const data = postUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.post.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      title: data.title,
      body: data.body,
      meta: data.meta,
      files: data.files,
      images: data.images,
      type: data.type,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
    },
  });

  let post = await prisma.post.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      user: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  post = await filePopulateDownloadUrlInTree(post);

  return post;
}
