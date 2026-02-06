import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { postCreateInputSchema } from 'src/features/post/postSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const postCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/post',
  request: {
    body: {
      content: {
        'application/json': {
          schema: postCreateInputSchema,
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

export async function postCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.postCreate, context);
  return await postCreate(body, context);
}

export async function postCreate(body: unknown, context: AppContext) {
  const data = postCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let post = await prisma.post.create({
    data: {
      title: data.title,
      body: data.body,
      files: data.files,
      images: data.images,
      type: data.type,
      meta: data.meta,
      user: prismaRelationship.connectOneOrThrow(data.user),
      importHash: data.importHash,
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
