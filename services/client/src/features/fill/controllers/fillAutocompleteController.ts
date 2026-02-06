import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  fillAutocompleteInputSchema,
  fillAutocompleteOutputSchema,
} from 'src/features/fill/fillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const fillAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fill/autocomplete',
  request: {
    query: fillAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(fillAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function fillAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.fillAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    fillAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.FillWhereInput> = [];

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

  let fills = await prisma.fill.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return fills.map((fill) => {
    return {
      id: fill.id,
    };
  });
}
