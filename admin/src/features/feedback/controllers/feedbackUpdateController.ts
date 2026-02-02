import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  feedbackUpdateBodyInputSchema,
  feedbackUpdateParamsInputSchema,
} from 'src/features/feedback/feedbackSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const feedbackUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/feedback/{id}',
  request: {
    params: feedbackUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: feedbackUpdateBodyInputSchema,
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

export async function feedbackUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feedbackUpdate,
    context,
  );

  const { id } = feedbackUpdateParamsInputSchema.parse(params);

  const data = feedbackUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.feedback.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      title: data.title,
      description: data.description,
      attachments: data.attachments,
      type: data.type,
      status: data.status,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
    },
  });

  let feedback = await prisma.feedback.findUniqueOrThrow({
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

  feedback = await filePopulateDownloadUrlInTree(feedback);

  return feedback;
}
