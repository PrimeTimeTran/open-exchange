import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { commentCreateInputSchema } from 'src/features/comment/commentSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const commentCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/comment',
  request: {
    body: {
      content: {
        'application/json': {
          schema: commentCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Comment',
    },
  },
};

export async function commentCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.commentCreate, context);
  return await commentCreate(body, context);
}

export async function commentCreate(body: unknown, context: AppContext) {
  const data = commentCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let comment = await prisma.comment.create({
    data: {
      body: data.body,
      meta: data.meta,
      type: data.type,
      images: data.images,
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

  comment = await filePopulateDownloadUrlInTree(comment);

  return comment;
}
