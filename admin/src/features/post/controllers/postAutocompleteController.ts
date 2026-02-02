import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  postAutocompleteInputSchema,
  postAutocompleteOutputSchema,
} from 'src/features/post/postSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const postAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/post/autocomplete',
  request: {
    query: postAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(postAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function postAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.postAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    postAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.PostWhereInput> = [];

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

  let posts = await prisma.post.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return posts.map((post) => {
    return {
      id: post.id,
    };
  });
}
