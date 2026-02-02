import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feedbackFindSchema } from 'src/features/feedback/feedbackSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const feedbackFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/feedback/{id}',
  request: {
    params: feedbackFindSchema,
  },
  responses: {
    200: {
      description: 'Feedback',
    },
  },
};

export async function feedbackFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feedbackRead,
    context,
  );

  const { id } = feedbackFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let feedback = await prisma.feedback.findUnique({
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
