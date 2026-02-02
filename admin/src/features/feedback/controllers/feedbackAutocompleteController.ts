import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  feedbackAutocompleteInputSchema,
  feedbackAutocompleteOutputSchema,
} from 'src/features/feedback/feedbackSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const feedbackAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/feedback/autocomplete',
  request: {
    query: feedbackAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(feedbackAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function feedbackAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feedbackAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    feedbackAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.FeedbackWhereInput> = [];

  whereAnd.push({ tenantId: currentTenant.id });

  whereAnd.push({ archivedAt: null });

  if (exclude) {
    whereAnd.push({
      id: {
        notIn: exclude,
      },
    });
  }

  if (search) {
    whereAnd.push({
      id: search,
    });
  }

  let feedbacks = await prisma.feedback.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return feedbacks.map((feedback) => {
    return {
      id: feedback.id,
    };
  });
}
