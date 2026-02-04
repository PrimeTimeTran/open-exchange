import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  articleAutocompleteInputSchema,
  articleAutocompleteOutputSchema,
} from 'src/features/article/articleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const articleAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/article/autocomplete',
  request: {
    query: articleAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(articleAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function articleAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.articleAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    articleAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ArticleWhereInput> = [];

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

  let articles = await prisma.article.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return articles.map((article) => {
    return {
      id: article.id,
    };
  });
}
