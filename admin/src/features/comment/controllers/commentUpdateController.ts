import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  commentUpdateBodyInputSchema,
  commentUpdateParamsInputSchema,
} from 'src/features/comment/commentSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const commentUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/comment/{id}',
  request: {
    params: commentUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: commentUpdateBodyInputSchema,
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

export async function commentUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.commentUpdate,
    context,
  );

  const { id } = commentUpdateParamsInputSchema.parse(params);

  const data = commentUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.comment.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      body: data.body,
      meta: data.meta,
      type: data.type,
      images: data.images,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
    },
  });

  let comment = await prisma.comment.findUniqueOrThrow({
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

  comment = await filePopulateDownloadUrlInTree(comment);

  return comment;
}
