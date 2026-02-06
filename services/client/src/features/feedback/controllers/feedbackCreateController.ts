import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feedbackCreateInputSchema } from 'src/features/feedback/feedbackSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const feedbackCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/feedback',
  request: {
    body: {
      content: {
        'application/json': {
          schema: feedbackCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Feedback',
    },
  },
};

export async function feedbackCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.feedbackCreate, context);
  return await feedbackCreate(body, context);
}

export async function feedbackCreate(body: unknown, context: AppContext) {
  const data = feedbackCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let feedback = await prisma.feedback.create({
    data: {
      title: data.title,
      description: data.description,
      attachments: data.attachments,
      type: data.type,
      status: data.status,
      json: data.json,
      user: prismaRelationship.connectOne(data.user),
      importHash: data.importHash,
    },
    include: {
      user: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  feedback = await filePopulateDownloadUrlInTree(feedback);

  return feedback;
}
