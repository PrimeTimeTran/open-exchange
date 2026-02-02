import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { feedbackFindManyInputSchema } from 'src/features/feedback/feedbackSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const feedbackFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/feedback',
  request: {
    query: feedbackFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ feedbacks: Feedback[], count: number }',
    },
  },
};

export async function feedbackFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feedbackRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    feedbackFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.FeedbackWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.title != null) {
    whereAnd.push({
      title: { contains: filter?.title, mode: 'insensitive' },
    });
  }

  if (filter?.description != null) {
    whereAnd.push({
      description: { contains: filter?.description, mode: 'insensitive' },
    });
  }

  if (filter?.type != null) {
    whereAnd.push({
      type: filter?.type,
    });
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  const prisma = prismaAuth(context);

  let feedbacks = await prisma.feedback.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.feedback.count({
    where: {
      AND: whereAnd,
    },
  });

  feedbacks = await filePopulateDownloadUrlInTree(feedbacks);

  return { feedbacks, count };
}
