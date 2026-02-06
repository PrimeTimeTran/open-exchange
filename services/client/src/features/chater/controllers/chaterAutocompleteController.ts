import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  chaterAutocompleteInputSchema,
  chaterAutocompleteOutputSchema,
} from 'src/features/chater/chaterSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const chaterAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chater/autocomplete',
  request: {
    query: chaterAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(chaterAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function chaterAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chaterAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    chaterAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ChaterWhereInput> = [];

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

  let chaters = await prisma.chater.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return chaters.map((chater) => {
    return {
      id: chater.id,
    };
  });
}
