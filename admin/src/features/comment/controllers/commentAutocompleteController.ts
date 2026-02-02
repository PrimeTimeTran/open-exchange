import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  commentAutocompleteInputSchema,
  commentAutocompleteOutputSchema,
} from 'src/features/comment/commentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const commentAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/comment/autocomplete',
  request: {
    query: commentAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(commentAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function commentAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.commentAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    commentAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.CommentWhereInput> = [];

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

  let comments = await prisma.comment.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return comments.map((comment) => {
    return {
      id: comment.id,
    };
  });
}
